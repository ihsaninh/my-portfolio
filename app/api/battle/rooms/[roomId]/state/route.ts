import { NextRequest, NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";
import { publishBattleEvent } from "@/src/lib/realtime";

type Participant = {
  id: string;
  session_id: string;
  display_name: string;
  is_host: boolean;
  connection_status: string;
  total_score: number;
};

type QuestionSummary = {
  prompt: string;
  difficulty: number;
  language: string;
  category?: string;
  // Optional for MCQ
  choices?: Array<{ id: string; text: string }>;
} | null;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const sessionId = getSessionIdFromCookies(req);
    const supabase = supabaseAdmin();

    console.log("State API - Session lookup:", {
      roomId,
      sessionId,
      cookies: req.cookies.toString(),
    });

    // Get room info with capacity
    const { data: room, error: roomErr } = await supabase
      .from("battle_rooms")
      .select(
        "id, topic, category_id, language, num_questions, round_time_sec, status, start_time, capacity, question_type"
      )
      .eq("id", roomId)
      .single();
    if (roomErr || !room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Get participants with session_id for proper mapping
    // Order by participant ID to maintain consistent ordering
    const { data: participants, error: participantsErr } = await supabase
      .from("battle_room_participants")
      .select(
        "id, session_id, display_name, is_host, connection_status, total_score"
      )
      .eq("room_id", roomId)
      .order("id", { ascending: true }); // Use participant ID for consistent ordering

    console.log("Participants query result:", {
      roomId,
      participantsCount: participants?.length || 0,
      participantsErr,
      participants: participants?.map((p) => ({
        id: p.id,
        session_id: p.session_id,
        display_name: p.display_name,
        is_host: p.is_host,
      })),
    });

    // Find current user if session exists
    let currentUser = null;
    if (sessionId && participants) {
      const currentParticipant = participants.find(
        (p: Participant) => p.session_id === sessionId
      );
      if (currentParticipant) {
        currentUser = {
          session_id: currentParticipant.session_id,
          display_name: currentParticipant.display_name,
          is_host: currentParticipant.is_host,
          total_score: currentParticipant.total_score,
        };
        console.log("Current user found in state API:", {
          sessionId,
          currentUser,
          participantCount: participants.length,
        });
      } else {
        console.log("Current user NOT found in participants:", {
          sessionId,
          participantSessions: participants.map((p) => p.session_id),
        });
      }
    } else {
      console.log("No session ID or participants for current user lookup:", {
        hasSessionId: !!sessionId,
        participantCount: participants?.length || 0,
      });
    }

    // Active round snapshot (if any)
    let { data: round } = await supabase
      .from("battle_room_rounds")
      .select(
        "round_no, revealed_at, deadline_at, status, question_id, question_json"
      )
      .eq("room_id", roomId)
      .eq("status", "active")
      .order("round_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    // On-read auto-close: if active round deadline has passed, close it and progress
    try {
      const now = Date.now();
      if (round && round.deadline_at && new Date(round.deadline_at).getTime() < now) {
        // Re-fetch round id for atomic close
        const { data: current } = await supabase
          .from("battle_room_rounds")
          .select("id, round_no, status")
          .eq("room_id", roomId)
          .eq("status", "active")
          .order("round_no", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (current?.status === "active") {
          // Atomically close if still active
          const { data: closed, error: closeErr } = await supabase
            .from("battle_room_rounds")
            .update({ status: "closed" })
            .eq("id", current.id)
            .eq("status", "active")
            .select("id, round_no")
            .single();

          if (!closeErr && closed) {
            // Update participant totals
            const { data: answers } = await supabase
              .from("battle_room_answers")
              .select("session_id, score_final")
              .eq("round_id", closed.id);

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

            // Prepare scoreboard payload
            const { data: participantsForMap } = await supabase
              .from("battle_room_participants")
              .select("session_id, display_name")
              .eq("room_id", roomId);
            const nameMap = new Map(
              (participantsForMap || []).map((p) => [p.session_id, p.display_name])
            );
            const roundScoreboard = (answers || []).map((a) => ({
              sessionId: a.session_id,
              displayName: nameMap.get(a.session_id) || "Player",
              score: a.score_final,
            }));

            // Broadcast round closed (best effort)
            publishBattleEvent({
              roomId,
              event: "round_closed",
              payload: { roundNo: closed.round_no, scoreboard: roundScoreboard },
            });

            // Check remaining rounds
            const { count: remaining } = await supabase
              .from("battle_room_rounds")
              .select("id", { count: "exact", head: true })
              .eq("room_id", roomId)
              .eq("status", "pending");

            if (!remaining || remaining === 0) {
              // Finish room
              await supabase
                .from("battle_rooms")
                .update({ status: "finished" })
                .eq("id", roomId);
              publishBattleEvent({ roomId, event: "match_finished", payload: { roomId } });
            } else {
              // Reveal next pending round immediately
              const { data: roomInfo } = await supabase
                .from("battle_rooms")
                .select("round_time_sec, status")
                .eq("id", roomId)
                .single();
              if (roomInfo?.status === "active") {
                const { data: nextRound } = await supabase
                  .from("battle_room_rounds")
                  .select("id, round_no")
                  .eq("room_id", roomId)
                  .eq("status", "pending")
                  .gt("round_no", closed.round_no)
                  .order("round_no")
                  .limit(1)
                  .maybeSingle();
                if (nextRound) {
                  const nowDate = new Date();
                  const deadline = new Date(
                    nowDate.getTime() + (roomInfo.round_time_sec || 60) * 1000
                  );
                  await supabase
                    .from("battle_room_rounds")
                    .update({
                      status: "active",
                      revealed_at: nowDate.toISOString(),
                      deadline_at: deadline.toISOString(),
                    })
                    .eq("id", nextRound.id);
                  publishBattleEvent({
                    roomId,
                    event: "round_revealed",
                    payload: {
                      roundNo: nextRound.round_no,
                      revealedAt: nowDate.toISOString(),
                      deadlineAt: deadline.toISOString(),
                      reason: "on_read_guard",
                    },
                  });
                }
              }
            }

            // Re-fetch the current active round snapshot after progression
            const { data: refreshed } = await supabase
              .from("battle_room_rounds")
              .select(
                "round_no, revealed_at, deadline_at, status, question_id, question_json"
              )
              .eq("room_id", roomId)
              .eq("status", "active")
              .order("round_no", { ascending: false })
              .limit(1)
              .maybeSingle();
            round = refreshed || null;
          }
        }
      }
    } catch (guardErr) {
      console.error("on-read auto-close guard error:", guardErr);
    }

    let questionSummary: QuestionSummary = null;
    if (round && round.revealed_at) {
      if (round.question_id) {
        const { data: q } = await supabase
          .from("quiz_questions")
          .select("prompt, difficulty, language, category_id")
          .eq("id", round.question_id)
          .single();
        if (q)
          questionSummary = {
            prompt: q.prompt,
            difficulty: q.difficulty,
            language: q.language,
            category: q.category_id,
          };
      } else if (round.question_json) {
        const q = round.question_json as {
          prompt: string;
          difficulty: number;
          language: string;
          category?: string;
          choices?: Array<{ id: string; text: string }>;
          correctChoiceId?: string;
        };
        questionSummary = {
          prompt: q.prompt,
          difficulty: q.difficulty,
          language: q.language,
          category: q.category,
          choices: q.choices?.map((c) => ({ id: c.id, text: c.text })),
        };
      }
    }

    return NextResponse.json({
      room,
      participants: (participants || []).map((p: Participant) => ({
        session_id: p.session_id, // Include session_id for host detection
        display_name: p.display_name,
        is_host: p.is_host,
        connection_status: p.connection_status,
        total_score: p.total_score,
        participantId: p.id, // Keep participantId for UI
      })),
      currentUser, // Include current user info for host detection
      activeRound: round
        ? {
            roundNo: round.round_no,
            revealedAt: round.revealed_at,
            deadlineAt: round.deadline_at,
            status: round.status,
            question: questionSummary, // includes choices for MCQ (without correct id)
          }
        : null,
    });
  } catch (e) {
    console.error("State exception", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
