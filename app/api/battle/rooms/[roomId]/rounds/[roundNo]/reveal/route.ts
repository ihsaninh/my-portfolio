import { NextRequest, NextResponse } from "next/server";

import { publishBattleEvent } from "@/src/lib/realtime";
import { supabaseAdmin } from "@/src/lib/supabase";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ roomId: string; roundNo: string }> }
) {
  try {
    const { roomId, roundNo } = await context.params;
    const supabase = supabaseAdmin();

    // Load room for timer
    const { data: room, error: roomErr } = await supabase
      .from("battle_rooms")
      .select("id, status, round_time_sec")
      .eq("id", roomId)
      .single();
    if (roomErr || !room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.status !== "active")
      return NextResponse.json({ error: "Room not active" }, { status: 400 });

    const now = new Date();
    const deadline = new Date(now.getTime() + room.round_time_sec * 1000);

    // Update the specified round to active
    const { error: updErr } = await supabase
      .from("battle_room_rounds")
      .update({
        status: "active",
        revealed_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
      })
      .eq("room_id", roomId)
      .eq("round_no", Number(roundNo));

    if (updErr) {
      console.error(updErr);
      return NextResponse.json(
        { error: "Failed to reveal round" },
        { status: 500 }
      );
    }

    // Broadcast
    publishBattleEvent({
      roomId,
      event: "round_revealed",
      payload: {
        roundNo: Number(roundNo),
        revealedAt: now.toISOString(),
        deadlineAt: deadline.toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      revealedAt: now.toISOString(),
      deadlineAt: deadline.toISOString(),
    });
  } catch (e) {
    console.error("Reveal round exception", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
