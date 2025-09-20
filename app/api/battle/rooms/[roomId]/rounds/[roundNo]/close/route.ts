import { NextRequest, NextResponse } from "next/server";

import { publishBattleEvent } from "@/src/lib/battle/realtime";
import {
  createErrorResponse,
  ERROR_TYPES,
} from "@/src/lib/services/api-errors";
import { getSessionIdFromCookies } from "@/src/lib/services/session";
import { supabaseAdmin } from "@/src/lib/services/supabase";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string; roundNo: string }> }
) {
  try {
    const { roomId, roundNo } = await context.params;
    const sessionId = getSessionIdFromCookies(req);
    if (!sessionId) {
      return createErrorResponse(ERROR_TYPES.MISSING_SESSION);
    }

    const supabase = supabaseAdmin();

    // Close round (idempotent)
    const { data: round, error: rErr } = await supabase
      .from("battle_room_rounds")
      .select("id, status")
      .eq("room_id", roomId)
      .eq("round_no", Number(roundNo))
      .single();
    if (rErr || !round)
      return createErrorResponse({
        code: "ROUND_NOT_FOUND",
        message: "The specified round was not found.",
        retryable: false,
        statusCode: 404,
      });

    const { data: room, error: roomErr } = await supabase
      .from("battle_rooms")
      .select("host_session_id")
      .eq("id", roomId)
      .single();

    if (roomErr || !room) {
      return createErrorResponse(ERROR_TYPES.ROOM_NOT_FOUND);
    }

    const { data: membership, error: membershipErr } = await supabase
      .from("battle_room_participants")
      .select("is_host")
      .eq("room_id", roomId)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (membershipErr && membershipErr.code !== "PGRST116") {
      return createErrorResponse(ERROR_TYPES.INTERNAL_ERROR);
    }

    const isHostSession = room.host_session_id === sessionId;

    if (!isHostSession && !membership?.is_host) {
      return createErrorResponse({
        code: "NOT_HOST",
        message: "Only the room host can close the round.",
        retryable: false,
        statusCode: 403,
      });
    }

    let justClosed = false;
    if (round.status !== "closed") {
      const { error: updErr } = await supabase
        .from("battle_room_rounds")
        .update({ status: "closed" })
        .eq("id", round.id);
      if (updErr) {
        return createErrorResponse(ERROR_TYPES.INTERNAL_ERROR);
      }
      justClosed = true;
    }

    // Scoreboard for this round
    const { data: answers, error: aErr } = await supabase
      .from("battle_room_answers")
      .select("session_id, score_final")
      .eq("round_id", round.id);
    if (aErr) {
      return createErrorResponse(ERROR_TYPES.INTERNAL_ERROR);
    }

    // Increment participant totals only once when transitioning to closed
    if (justClosed && answers && answers.length > 0) {
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

    const { data: participants } = await supabase
      .from("battle_room_participants")
      .select("session_id, display_name, id")
      .eq("room_id", roomId);

    const mapBySession = new Map(
      (participants || []).map((p) => [
        p.session_id,
        { name: p.display_name, pid: p.id },
      ])
    );
    const scoreboard = (answers || []).map((a) => {
      const m = mapBySession.get(a.session_id);
      return {
        participantId: m?.pid,
        displayName: m?.name || "Player",
        score: a.score_final,
      };
    });

    // Auto-finish if all rounds are closed
    const { count: openCount } = await supabase
      .from("battle_room_rounds")
      .select("id", { count: "exact", head: true })
      .eq("room_id", roomId)
      .neq("status", "closed");

    let finished = false;
    if (!openCount || openCount === 0) {
      const { error: finishErr } = await supabase
        .from("battle_rooms")
        .update({ status: "finished" })
        .eq("id", roomId);
      if (!finishErr) finished = true;
    }

    // Broadcast round_closed and maybe match_finished
    await publishBattleEvent({
      roomId,
      event: "round_closed",
      payload: { roundNo: Number(roundNo), scoreboard },
    });
    if (finished) {
      await publishBattleEvent({
        roomId,
        event: "match_finished",
        payload: { roomId },
      });
    }

    return NextResponse.json({
      ok: true,
      roundScoreboard: scoreboard,
      finished,
    });
  } catch (e: unknown) {
    return createErrorResponse(e);
  }
}
