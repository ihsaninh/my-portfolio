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

    // Close round (idempotent)
    const { data: round, error: rErr } = await supabase
      .from("battle_room_rounds")
      .select("id, status")
      .eq("room_id", roomId)
      .eq("round_no", Number(roundNo))
      .single();
    if (rErr || !round)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    let justClosed = false;
    if (round.status !== "closed") {
      const { error: updErr } = await supabase
        .from("battle_room_rounds")
        .update({ status: "closed" })
        .eq("id", round.id);
      if (updErr) {
        console.error(updErr);
        return NextResponse.json(
          { error: "Failed to close round" },
          { status: 500 }
        );
      }
      justClosed = true;
    }

    // Scoreboard for this round
    const { data: answers, error: aErr } = await supabase
      .from("battle_room_answers")
      .select("session_id, score_final")
      .eq("round_id", round.id);
    if (aErr) {
      console.error(aErr);
      return NextResponse.json(
        { error: "Failed to get answers" },
        { status: 500 }
      );
    }

    // Increment participant totals only once when transitioning to closed
    if (justClosed && answers && answers.length > 0) {
      console.log(
        `Updating scores for ${answers.length} answers in round ${roundNo}:`
      );
      console.log(
        "Answers found:",
        answers.map((a) => ({
          session_id: a.session_id,
          score_final: a.score_final,
        }))
      );

      for (const a of answers) {
        const { data: curr } = await supabase
          .from("battle_room_participants")
          .select("total_score")
          .eq("room_id", roomId)
          .eq("session_id", a.session_id)
          .single();
        const next = (curr?.total_score || 0) + (a.score_final || 0);
        console.log(
          `Session ${a.session_id}: ${curr?.total_score || 0} + ${
            a.score_final || 0
          } = ${next}`
        );
        const { error: updateErr } = await supabase
          .from("battle_room_participants")
          .update({ total_score: next })
          .eq("room_id", roomId)
          .eq("session_id", a.session_id);

        if (updateErr) {
          console.error("Failed to update participant score:", updateErr);
        } else {
          console.log(
            `Successfully updated session ${a.session_id} total_score to ${next}`
          );
        }
      }

      console.log("Score updates completed");
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
    publishBattleEvent({
      roomId,
      event: "round_closed",
      payload: { roundNo: Number(roundNo), scoreboard },
    });
    if (finished) {
      publishBattleEvent({
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
  } catch (e) {
    console.error("Close round exception", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
