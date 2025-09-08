import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateQuestions } from "@/src/lib/ai-question-gen";
import { publishBattleEvent } from "@/src/lib/realtime";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

const StartSchema = z.object({ useAI: z.boolean().optional() });

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const body = StartSchema.parse(await req.json().catch(() => ({})));
    const hostSessionId = getSessionIdFromCookies(req);
    if (!hostSessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }
    const supabase = supabaseAdmin();

    // Get additional headers for enhanced host validation
    const hostTabId = req.headers.get("X-Battle-Host-Tab");
    const hostSessionFromClient = req.headers.get("X-Battle-Host-Session");

    console.log("Start battle request:", {
      roomId,
      requestSessionId: hostSessionId,
      hostTabId,
      hostSessionFromClient,
    });

    // Load room
    const { data: room, error: roomErr } = await supabase
      .from("battle_rooms")
      .select(
        "id, host_session_id, status, num_questions, category_id, language, round_time_sec, topic"
      )
      .eq("id", roomId)
      .single();
    if (roomErr || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    if (room.host_session_id !== hostSessionId) {
      console.error(
        `Host session mismatch. Room host: ${room.host_session_id}, Request session: ${hostSessionId}`
      );

      // Check if the client claims to be the original host
      if (
        hostSessionFromClient &&
        hostSessionFromClient === room.host_session_id
      ) {
        console.log(
          `Client provided original host session: ${hostSessionFromClient}, allowing start`
        );
        // Allow the start - client has the original host session
      } else {
        // Additional check: see if the current session belongs to a host participant
        const { data: currentParticipant } = await supabase
          .from("battle_room_participants")
          .select("is_host, display_name")
          .eq("room_id", roomId)
          .eq("session_id", hostSessionId)
          .single();

        if (currentParticipant?.is_host) {
          console.log(
            `Session mismatch but current session is a host participant: ${hostSessionId}`
          );
          // Allow the start - this handles the case where session cookies got mixed up
          // but the current user is still a host participant
        } else {
          return NextResponse.json(
            { error: "Only host can start" },
            { status: 403 }
          );
        }
      }
    }
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Room already started" },
        { status: 400 }
      );
    }

    // Prefer AI generation if enabled; fallback to bank
    let inserts: Array<{
      id: string;
      room_id: string;
      round_no: number;
      question_id: string | null;
      question_json: Record<string, unknown> | null;
      status: "pending";
    }> = [];
    let usedAI = false;
    let aiError: string | undefined;
    const preferAI = body.useAI ?? process.env.BATTLE_USE_AI === "1";
    if (preferAI) {
      try {
        let categoryName: string | null = null;
        if (room.category_id) {
          const { data: cat } = await supabase
            .from("quiz_categories")
            .select("name")
            .eq("id", room.category_id)
            .single();
          categoryName = cat?.name ?? null;
        }
        const aiQs = await generateQuestions({
          topic: room.topic || null,
          categoryName,
          categoryId: room.category_id || null,
          language: room.language,
          num: room.num_questions,
          seed: `${roomId}-${Date.now()}`,
        });
        if (aiQs.length > 0) {
          inserts = aiQs.map((q, idx) => ({
            id: `round-${roomId}-${idx + 1}`,
            room_id: roomId,
            round_no: idx + 1,
            question_id: null,
            question_json: q,
            status: "pending" as const,
          }));
          usedAI = true;
        }
      } catch (e) {
        console.error("AI question generation failed, fallback to bank", e);
        aiError = (e as Error).message;
      }
    }

    if (inserts.length === 0) {
      const { data: questions, error: qErr } = await supabase
        .from("quiz_questions")
        .select("id, prompt, difficulty, rubric_json, language, category_id")
        .eq("is_active", true)
        .eq("language", room.language)
        .order("created_at")
        .limit(room.num_questions);
      if (qErr) {
        console.error(qErr);
        return NextResponse.json(
          { error: "Failed to prepare questions" },
          { status: 500 }
        );
      }
      if (!questions || questions.length === 0) {
        return NextResponse.json(
          { error: "No questions available" },
          { status: 400 }
        );
      }
      inserts = questions.map((q, idx) => ({
        id: `round-${roomId}-${idx + 1}`,
        room_id: roomId,
        round_no: idx + 1,
        question_id: q.id,
        question_json: null,
        status: "pending" as const,
      }));
    }
    const { error: rErr } = await supabase
      .from("battle_room_rounds")
      .insert(inserts);
    if (rErr) {
      console.error(rErr);
      return NextResponse.json(
        { error: "Failed to create rounds" },
        { status: 500 }
      );
    }

    // Mark room active and set start time
    const { error: updErr } = await supabase
      .from("battle_rooms")
      .update({ status: "active", start_time: new Date().toISOString() })
      .eq("id", roomId);
    if (updErr) {
      console.error(updErr);
      return NextResponse.json(
        { error: "Failed to start room" },
        { status: 500 }
      );
    }

    // Broadcast room started
    publishBattleEvent({
      roomId,
      event: "room_started",
      payload: { startTime: new Date().toISOString() },
    });

    // Small delay to ensure all clients receive room_started before round_revealed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Auto-reveal first round (Round 1)
    const now = new Date();
    const deadline = new Date(now.getTime() + room.round_time_sec * 1000);

    const { error: revealErr } = await supabase
      .from("battle_room_rounds")
      .update({
        status: "active",
        revealed_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
      })
      .eq("room_id", roomId)
      .eq("round_no", 1);

    if (revealErr) {
      console.error("Failed to reveal first round:", revealErr);
      // Don't fail the entire start operation, just log the error
    } else {
      console.log("First round revealed successfully");
      // Broadcast first round revealed
      publishBattleEvent({
        roomId,
        event: "round_revealed",
        payload: {
          roundNo: 1,
          revealedAt: now.toISOString(),
          deadlineAt: deadline.toISOString(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      numRounds: inserts.length,
      roundTimeSec: room.round_time_sec,
      source: usedAI ? "ai" : "bank",
      ...(aiError ? { aiError } : {}),
    });
  } catch (e: unknown) {
    console.error("Start room exception", e);
    if (e && typeof e === "object" && "issues" in e)
      return NextResponse.json(
        { error: (e as { issues: unknown }).issues },
        { status: 400 }
      );
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
