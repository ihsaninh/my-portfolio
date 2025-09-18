import { NextResponse } from "next/server";

import { publishBattleEvent } from "@/src/lib/battle/realtime";
import { createErrorResponse } from "@/src/lib/services/api-errors";
import { supabaseAdmin } from "@/src/lib/services/supabase";

// Auto-close any active rounds whose deadline has passed, and optionally auto-reveal next round
export async function POST() {
  const supabase = supabaseAdmin();
  const nowIso = new Date().toISOString();
  const AUTO_REVEAL_NEXT = process.env.BATTLE_AUTO_REVEAL_NEXT === "1";

  try {
    const { data: dueRounds, error: listErr } = await supabase
      .from("battle_room_rounds")
      .select("id, room_id, round_no, status")
      .eq("status", "active")
      .lte("deadline_at", nowIso)
      .limit(100); // batch
    if (listErr) {
      console.error("Failed to list due rounds:", listErr);
      return createErrorResponse({
        code: "INTERNAL_ERROR",
        message: "Failed to process auto-close operation.",
        retryable: true,
        statusCode: 500,
      });
    }

    for (const r of dueRounds || []) {
      // Double-check current status
      const { data: round, error: rErr } = await supabase
        .from("battle_room_rounds")
        .select("id, room_id, round_no, status")
        .eq("id", r.id)
        .single();
      if (rErr || !round) continue;
      if (round.status === "closed") continue;

      // Close it
      await supabase
        .from("battle_room_rounds")
        .update({ status: "closed" })
        .eq("id", round.id);

      // Get answers and participants for scoreboard + totals
      const { data: answers } = await supabase
        .from("battle_room_answers")
        .select("session_id, score_final")
        .eq("round_id", round.id);

      if (answers && answers.length > 0) {
        for (const a of answers) {
          const { data: curr } = await supabase
            .from("battle_room_participants")
            .select("total_score")
            .eq("room_id", round.room_id)
            .eq("session_id", a.session_id)
            .single();
          const next = (curr?.total_score || 0) + (a.score_final || 0);
          await supabase
            .from("battle_room_participants")
            .update({ total_score: next })
            .eq("room_id", round.room_id)
            .eq("session_id", a.session_id);
        }
      }

      // Prepare scoreboard payload
      const { data: participants } = await supabase
        .from("battle_room_participants")
        .select("session_id, display_name")
        .eq("room_id", round.room_id);
      const nameMap = new Map(
        (participants || []).map((p) => [p.session_id, p.display_name])
      );
      const roundScoreboard = (answers || []).map((a) => ({
        sessionId: a.session_id,
        displayName: nameMap.get(a.session_id) || "Player",
        score: a.score_final,
      }));
      publishBattleEvent({
        roomId: round.room_id,
        event: "round_closed",
        payload: { roundNo: round.round_no, scoreboard: roundScoreboard },
      });

      // Auto finish or auto reveal next
      const { count: openCount } = await supabase
        .from("battle_room_rounds")
        .select("id", { count: "exact", head: true })
        .eq("room_id", round.room_id)
        .neq("status", "closed");
      if (!openCount || openCount === 0) {
        await supabase
          .from("battle_rooms")
          .update({ status: "finished" })
          .eq("id", round.room_id);
        publishBattleEvent({
          roomId: round.room_id,
          event: "match_finished",
          payload: { roomId: round.room_id },
        });
        continue;
      }

      if (AUTO_REVEAL_NEXT) {
        // Load room settings
        const { data: room } = await supabase
          .from("battle_rooms")
          .select("round_time_sec")
          .eq("id", round.room_id)
          .single();
        const now = new Date();
        const deadline = new Date(
          now.getTime() + (room?.round_time_sec || 60) * 1000
        );

        const { data: nextRound } = await supabase
          .from("battle_room_rounds")
          .select("id, round_no")
          .eq("room_id", round.room_id)
          .eq("status", "pending")
          .gt("round_no", round.round_no)
          .order("round_no")
          .limit(1)
          .maybeSingle();
        if (nextRound) {
          await supabase
            .from("battle_room_rounds")
            .update({
              status: "active",
              revealed_at: now.toISOString(),
              deadline_at: deadline.toISOString(),
            })
            .eq("id", nextRound.id);
          publishBattleEvent({
            roomId: round.room_id,
            event: "round_revealed",
            payload: {
              roundNo: nextRound.round_no,
              revealedAt: now.toISOString(),
              deadlineAt: deadline.toISOString(),
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, processed: (dueRounds || []).length });
  } catch (e: unknown) {
    console.error("auto-close failed", e);
    return createErrorResponse(e);
  }
}
