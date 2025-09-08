import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { publishBattleEvent } from "@/src/lib/realtime";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseServer } from "@/src/lib/supabase";

const FinishSchema = z.object({});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    FinishSchema.parse(await req.json().catch(() => ({})));
    const supabase = supabaseServer();
    const hostSessionId = getSessionIdFromCookies(req);
    if (!hostSessionId) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 }
      );
    }

    // Validate host
    const { data: room, error: rErr } = await supabase
      .from("battle_rooms")
      .select("id, host_session_id, status")
      .eq("id", roomId)
      .single();
    if (rErr || !room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.host_session_id !== hostSessionId)
      return NextResponse.json(
        { error: "Only host can finish" },
        { status: 403 }
      );

    // Ensure all rounds are closed
    const { count: openCount } = await supabase
      .from("battle_room_rounds")
      .select("id", { count: "exact", head: true })
      .eq("room_id", roomId)
      .neq("status", "closed");
    if (openCount && openCount > 0) {
      return NextResponse.json(
        { error: "There are still active/pending rounds" },
        { status: 400 }
      );
    }

    // Fetch final standings from participants totals
    const { data: participants, error: pErr } = await supabase
      .from("battle_room_participants")
      .select("id, display_name, total_score, is_host")
      .eq("room_id", roomId);
    if (pErr) {
      console.error(pErr);
      return NextResponse.json(
        { error: "Failed to compute standings" },
        { status: 500 }
      );
    }

    const standings = (participants || [])
      .map((p) => ({
        participantId: p.id,
        displayName: p.display_name,
        totalScore: p.total_score || 0,
        isHost: p.is_host,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const { error: updErr } = await supabase
      .from("battle_rooms")
      .update({ status: "finished" })
      .eq("id", roomId);
    if (updErr) {
      console.error(updErr);
      return NextResponse.json(
        { error: "Failed to finish room" },
        { status: 500 }
      );
    }

    // Broadcast match finished with standings (names + totals only)
    publishBattleEvent({
      roomId,
      event: "match_finished",
      payload: { standings },
    });

    return NextResponse.json({ ok: true, standings });
  } catch (e: unknown) {
    console.error("Finish exception", e);
    if (e && typeof e === "object" && "issues" in e)
      return NextResponse.json(
        { error: (e as { issues: unknown }).issues },
        { status: 400 }
      );
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
