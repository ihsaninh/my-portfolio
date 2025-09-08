import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/src/lib/supabase";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const supabase = supabaseAdmin();

    const { data: participants, error: pErr } = await supabase
      .from("battle_room_participants")
      .select("id, display_name, total_score")
      .eq("room_id", roomId);
    if (pErr) {
      console.error(pErr);
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    const board = (participants || []).map((p) => ({
      participantId: p.id,
      displayName: p.display_name,
      totalScore: p.total_score || 0,
    }));

    board.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ scoreboard: board });
  } catch (e) {
    console.error("Scoreboard exception", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
