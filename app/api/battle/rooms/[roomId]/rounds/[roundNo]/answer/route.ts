import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { evaluateAnswer } from "@/src/lib/ai-scoring";
import { publishBattleEvent } from "@/src/lib/realtime";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

const AnswerSchema = z.object({ answer_text: z.string().min(1).max(5000) });

const GRACE_MS = 3000; // small grace to tolerate minor clock drift

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string; roundNo: string }> }
) {
  try {
    const { roomId, roundNo } = await context.params;
    const body = AnswerSchema.parse(await req.json());
    const sessionId = getSessionIdFromCookies(req);
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }
    const supabase = supabaseAdmin();

    // Load round and check status/deadline
    const { data: round, error: roundErr } = await supabase
      .from("battle_room_rounds")
      .select("id, status, deadline_at, question_id, question_json")
      .eq("room_id", roomId)
      .eq("round_no", Number(roundNo))
      .single();
    if (roundErr || !round)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    if (round.status !== "active")
      return NextResponse.json({ error: "Round not active" }, { status: 400 });
    if (
      round.deadline_at &&
      Date.now() > new Date(round.deadline_at).getTime() + GRACE_MS
    ) {
      return NextResponse.json({ error: "Deadline passed" }, { status: 400 });
    }

    // Ensure participant is in room
    const { data: part, error: partErr } = await supabase
      .from("battle_room_participants")
      .select("id")
      .eq("room_id", roomId)
      .eq("session_id", sessionId)
      .single();
    if (partErr || !part)
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    // Fetch question for evaluation
    let question: {
      prompt: string;
      difficulty: number;
      rubric_json: Record<string, unknown> | null;
      language: string;
      category: string;
    } = {
      prompt: "",
      difficulty: 2,
      rubric_json: null,
      language: "en",
      category: "tech",
    };
    if (round.question_id) {
      const { data: q, error: qErr } = await supabase
        .from("quiz_questions")
        .select("prompt, difficulty, rubric_json, language, category_id")
        .eq("id", round.question_id)
        .single();
      if (qErr || !q)
        return NextResponse.json(
          { error: "Question missing" },
          { status: 500 }
        );
      question = {
        prompt: q.prompt,
        difficulty: q.difficulty ?? 2,
        rubric_json: q.rubric_json,
        language: q.language ?? "en",
        category: q.category_id ?? "tech",
      };
    } else if (round.question_json) {
      const q = round.question_json as Record<string, unknown>;
      question = {
        prompt: (q.prompt as string) ?? "",
        difficulty: (q.difficulty as number) ?? 2,
        rubric_json: (q.rubric_json as Record<string, unknown>) ?? null,
        language: (q.language as string) ?? "en",
        category: (q.category as string) ?? "tech",
      };
    }

    // Evaluate answer (AI with fallback inside evaluator)
    const ai = await evaluateAnswer({
      question: question.prompt,
      answer: body.answer_text,
      category: question.category,
      difficulty: Number(question.difficulty ?? 2),
      language: question.language,
      rubric: question.rubric_json ?? undefined,
    });

    // Insert answer
    const id = `bra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log("Inserting battle answer:", {
      id,
      room_id: roomId,
      round_id: round.id,
      session_id: sessionId,
      score_ai: ai.score,
      score_final: ai.score,
      answer_length: body.answer_text.length,
    });

    const { error: ansErr } = await supabase
      .from("battle_room_answers")
      .insert({
        id,
        room_id: roomId,
        round_id: round.id,
        session_id: sessionId,
        answer_text: body.answer_text,
        score_ai: ai.score,
        score_rule: null,
        score_final: ai.score,
        feedback: ai.feedback,
      });
    if (ansErr) {
      if ((ansErr as Error & { code?: string }).code === "23505") {
        console.log("Duplicate answer attempt:", {
          room_id: roomId,
          round_no: roundNo,
          session_id: sessionId,
          error_code: (ansErr as Error & { code?: string }).code,
        });
        return NextResponse.json(
          { error: "Already answered" },
          { status: 409 }
        );
      }
      console.error("Answer insert error:", ansErr);
      return NextResponse.json(
        { error: "Failed to store answer" },
        { status: 500 }
      );
    }

    console.log("Answer submitted successfully:", {
      answer_id: id,
      session_id: sessionId,
      score: ai.score,
      round_no: roundNo,
    });

    // Broadcast answer_received (no content)
    publishBattleEvent({
      roomId,
      event: "answer_received",
      payload: { roundNo: Number(roundNo), participantId: part.id },
    });

    // Check if all participants have answered for auto-advance
    const autoAdvanceEnabled = process.env.BATTLE_AUTO_ADVANCE !== "false";
    if (autoAdvanceEnabled) {
      await checkAndAutoAdvanceRound(roomId, round.id, Number(roundNo));
    }

    return NextResponse.json({ score: ai.score, feedback: ai.feedback });
  } catch (e: unknown) {
    console.error("Answer exception", e);
    if (e && typeof e === "object" && "issues" in e)
      return NextResponse.json(
        { error: (e as { issues: unknown }).issues },
        { status: 400 }
      );
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

/**
 * Check if all participants have answered and auto-advance to next round
 */
async function checkAndAutoAdvanceRound(
  roomId: string,
  roundId: string,
  roundNo: number
) {
  const supabase = supabaseAdmin();

  try {
    // Use a transaction-like approach to prevent race conditions
    // First, check if the round is still active (not already closed by another request)
    const { data: currentRound } = await supabase
      .from("battle_room_rounds")
      .select("status")
      .eq("id", roundId)
      .single();

    if (!currentRound || currentRound.status !== "active") {
      console.log(`Round ${roundNo} is not active, skipping auto-advance`);
      return;
    }
    // Get total participants in the room
    const { count: totalParticipants } = await supabase
      .from("battle_room_participants")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    // Get total answers for this round
    const { count: totalAnswers } = await supabase
      .from("battle_room_answers")
      .select("*", { count: "exact", head: true })
      .eq("round_id", roundId);

    console.log(
      `Auto-advance check: ${totalAnswers}/${totalParticipants} answered for round ${roundNo}`
    );

    // If everyone has answered, auto-close the round
    if (
      totalParticipants &&
      totalAnswers &&
      totalAnswers >= totalParticipants
    ) {
      console.log(`All participants answered! Auto-closing round ${roundNo}`);

      // Close the current round atomically
      const { data: closedRound, error: closeError } = await supabase
        .from("battle_room_rounds")
        .update({ status: "closed" })
        .eq("id", roundId)
        .eq("status", "active") // Only close if still active
        .select("status")
        .single();

      if (closeError || !closedRound) {
        console.log(`Round ${roundNo} was already closed by another request`);
        return;
      }

      // Get answers for scoreboard
      const { data: answers } = await supabase
        .from("battle_room_answers")
        .select("session_id, score_final")
        .eq("round_id", roundId);

      // Update participant totals
      if (answers && answers.length > 0) {
        for (const a of answers) {
          const { data: curr } = await supabase
            .from("battle_room_participants")
            .select("total_score")
            .eq("room_id", roomId)
            .eq("session_id", a.session_id)
            .single();
          const next = (curr?.total_score || 0) + (a.score_final || 0);
          await supabase
            .from("battle_room_participants")
            .update({ total_score: next })
            .eq("room_id", roomId)
            .eq("session_id", a.session_id);
        }
      }

      // Prepare scoreboard for broadcast
      const { data: participants } = await supabase
        .from("battle_room_participants")
        .select("session_id, display_name")
        .eq("room_id", roomId);

      const nameMap = new Map(
        (participants || []).map((p) => [p.session_id, p.display_name])
      );

      const roundScoreboard = (answers || []).map((a) => ({
        sessionId: a.session_id,
        displayName: nameMap.get(a.session_id) || "Player",
        score: a.score_final,
      }));

      // Broadcast round closed
      publishBattleEvent({
        roomId,
        event: "round_closed",
        payload: {
          roundNo,
          scoreboard: roundScoreboard,
          reason: "all_answered", // New field to indicate auto-advance
        },
      });

      // Check if this was the last round
      const { count: remainingRounds } = await supabase
        .from("battle_room_rounds")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId)
        .eq("status", "pending");

      if (!remainingRounds || remainingRounds === 0) {
        // Finish the battle
        await supabase
          .from("battle_rooms")
          .update({ status: "finished" })
          .eq("id", roomId);

        publishBattleEvent({
          roomId,
          event: "match_finished",
          payload: { roomId },
        });
      } else {
        // Auto-reveal next round immediately (no setTimeout in serverless)
        await autoRevealNextRound(roomId, roundNo + 1);
      }
    }
  } catch (error) {
    console.error("Auto-advance check failed:", error);
    // Don't throw - this shouldn't break the answer submission
  }
}

/**
 * Auto-reveal the next round
 */
async function autoRevealNextRound(roomId: string, nextRoundNo: number) {
  const supabase = supabaseAdmin();

  try {
    // Get room settings for timer
    const { data: room } = await supabase
      .from("battle_rooms")
      .select("round_time_sec, status")
      .eq("id", roomId)
      .single();

    if (!room || room.status !== "active") {
      console.log("Room not active, skipping auto-reveal");
      return;
    }

    const now = new Date();
    const deadline = new Date(
      now.getTime() + (room.round_time_sec || 60) * 1000
    );

    // Reveal next round atomically
    const { data: revealedRound, error: revealErr } = await supabase
      .from("battle_room_rounds")
      .update({
        status: "active",
        revealed_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
      })
      .eq("room_id", roomId)
      .eq("round_no", nextRoundNo)
      .eq("status", "pending") // Only reveal if still pending
      .select("round_no, status")
      .single();

    if (revealErr || !revealedRound) {
      console.error("Failed to auto-reveal next round:", {
        roomId,
        nextRoundNo,
        error: revealErr,
        revealedRound,
      });
      return;
    }

    console.log(`Auto-revealed round ${nextRoundNo}`);

    // Broadcast round revealed
    publishBattleEvent({
      roomId,
      event: "round_revealed",
      payload: {
        roundNo: nextRoundNo,
        revealedAt: now.toISOString(),
        deadlineAt: deadline.toISOString(),
        reason: "auto_advance", // Indicate this was auto-revealed
      },
    });
  } catch (error) {
    console.error("Auto-reveal failed:", error);
  }
}
