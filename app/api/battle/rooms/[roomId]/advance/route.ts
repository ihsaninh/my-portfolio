import { NextRequest, NextResponse } from "next/server";

import { publishBattleEvent } from "@/src/lib/realtime";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

/**
 * Manual advance API - fallback for when auto-advance fails
 * This endpoint can be called to force progression to the next round
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const sessionId = getSessionIdFromCookies(req);

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }

    const supabase = supabaseAdmin();

    // Verify the user is a participant in this room
    const { data: participant } = await supabase
      .from("battle_room_participants")
      .select("is_host")
      .eq("room_id", roomId)
      .eq("session_id", sessionId)
      .single();

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this room" },
        { status: 403 }
      );
    }

    // Only hosts can manually advance
    if (!participant.is_host) {
      return NextResponse.json(
        { error: "Only the host can advance rounds" },
        { status: 403 }
      );
    }

    // Get the current room status
    const { data: room } = await supabase
      .from("battle_rooms")
      .select("status, num_questions")
      .eq("id", roomId)
      .single();

    if (!room || room.status !== "active") {
      return NextResponse.json(
        { error: "Room is not active" },
        { status: 400 }
      );
    }

    // Check if there's a closed round that needs to be advanced
    const { data: lastClosedRound } = await supabase
      .from("battle_room_rounds")
      .select("round_no")
      .eq("room_id", roomId)
      .eq("status", "closed")
      .order("round_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastClosedRound) {
      return NextResponse.json(
        { error: "No closed round found to advance from" },
        { status: 400 }
      );
    }

    const nextRoundNo = lastClosedRound.round_no + 1;

    // Check if this is the last round
    if (nextRoundNo > room.num_questions) {
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

      return NextResponse.json({
        message: "Battle finished",
        action: "finished",
      });
    }

    // Reveal next round
    const now = new Date();
    const deadline = new Date(now.getTime() + 60 * 1000); // Default 60 seconds

    const { data: revealedRound, error: revealErr } = await supabase
      .from("battle_room_rounds")
      .update({
        status: "active",
        revealed_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
      })
      .eq("room_id", roomId)
      .eq("round_no", nextRoundNo)
      .eq("status", "pending")
      .select("round_no")
      .single();

    if (revealErr || !revealedRound) {
      return NextResponse.json(
        { error: "Failed to reveal next round" },
        { status: 500 }
      );
    }

    // Broadcast round revealed
    publishBattleEvent({
      roomId,
      event: "round_revealed",
      payload: {
        roundNo: nextRoundNo,
        revealedAt: now.toISOString(),
        deadlineAt: deadline.toISOString(),
        reason: "manual_advance",
      },
    });

    return NextResponse.json({
      message: "Round advanced successfully",
      roundNo: nextRoundNo,
      action: "advanced",
    });
  } catch (error) {
    console.error("Manual advance failed:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
