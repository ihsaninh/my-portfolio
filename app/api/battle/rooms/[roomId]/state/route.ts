import { NextRequest, NextResponse } from "next/server";

import { createErrorResponse, ERROR_TYPES } from "@/src/lib/api-errors";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";
import type { ApiParticipant } from "@/src/types/battle";

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

    // Get room info with capacity
    const { data: room, error: roomErr } = await supabase
      .from("battle_rooms")
      .select(
        "id, topic, category_id, language, num_questions, round_time_sec, status, start_time, capacity, question_type, room_code"
      )
      .eq("id", roomId)
      .single();
    if (roomErr || !room)
      return createErrorResponse(ERROR_TYPES.ROOM_NOT_FOUND);

    // Get participants with session_id for proper mapping
    // Order by participant ID to maintain consistent ordering
    const { data: participants } = await supabase
      .from("battle_room_participants")
      .select(
        "id, session_id, display_name, is_host, connection_status, total_score"
      )
      .eq("room_id", roomId)
      .order("id", { ascending: true }); // Use participant ID for consistent ordering
    // Find current user if session exists
    let currentUser = null;
    if (sessionId && participants) {
      const currentParticipant = participants.find(
        (p: ApiParticipant) => p.session_id === sessionId
      );
      if (currentParticipant) {
        currentUser = {
          session_id: currentParticipant.session_id,
          display_name: currentParticipant.display_name,
          is_host: currentParticipant.is_host,
          total_score: currentParticipant.total_score,
        };
      }
    }

    // Active round snapshot (if any)
    const { data: round } = await supabase
      .from("battle_room_rounds")
      .select(
        "round_no, revealed_at, deadline_at, status, question_id, question_json"
      )
      .eq("room_id", roomId)
      .eq("status", "active")
      .order("round_no", { ascending: false })
      .limit(1)
      .maybeSingle();

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
      participants: (participants || []).map((p: ApiParticipant) => ({
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
      serverTime: Date.now(), // Include server time for accurate client timer
    });
  } catch (e: unknown) {
    return createErrorResponse(e);
  }
}
