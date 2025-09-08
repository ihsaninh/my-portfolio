import { NextRequest, NextResponse } from "next/server";

import { publishBattleEvent } from "@/src/lib/realtime";
import { getSessionIdFromCookies } from "@/src/lib/session";
import { supabaseAdmin } from "@/src/lib/supabase";

type ParticipantAnswerStatus = {
  session_id: string;
  display_name: string;
  has_answered: boolean;
  is_host: boolean;
};

export async function GET(
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

    // Get the current active round
    const { data: activeRound } = await supabase
      .from("battle_room_rounds")
      .select("id, round_no")
      .eq("room_id", roomId)
      .eq("status", "active")
      .order("round_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!activeRound) {
      return NextResponse.json({
        participants: [],
        currentRound: null,
        totalAnswered: 0,
      });
    }

    // Get all participants in the room
    const { data: participants } = await supabase
      .from("battle_room_participants")
      .select("session_id, display_name, is_host")
      .eq("room_id", roomId)
      .order("display_name", { ascending: true });

    // Get who has answered this round
    const { data: answers } = await supabase
      .from("battle_room_answers")
      .select("session_id")
      .eq("round_id", activeRound.id);

    const answeredSessionIds = new Set(
      (answers || []).map((a) => a.session_id)
    );

    // Combine data to show answer status
    const participantStatus: ParticipantAnswerStatus[] = (
      participants || []
    ).map((p) => ({
      session_id: p.session_id,
      display_name: p.display_name,
      has_answered: answeredSessionIds.has(p.session_id),
      is_host: p.is_host,
    }));

    const totalAnswered = participantStatus.filter(
      (p) => p.has_answered
    ).length;

    // Check if all participants have answered and trigger auto-close
    const allAnswered =
      totalAnswered === participantStatus.length &&
      participantStatus.length > 0;

    if (allAnswered) {
      console.log(
        `🏁 All ${participantStatus.length} participants have answered round ${activeRound.round_no}`
      );

      // Trigger auto-close event to notify clients
      setTimeout(async () => {
        try {
          await publishBattleEvent({
            roomId,
            event: "all_participants_answered",
            payload: {
              roundNo: activeRound.round_no,
              totalAnswered,
              totalParticipants: participantStatus.length,
            },
          });
        } catch (err) {
          console.error(
            "Failed to publish all_participants_answered event:",
            err
          );
        }
      }, 100); // Small delay to ensure response is sent first
    }

    return NextResponse.json({
      participants: participantStatus,
      currentRound: activeRound.round_no,
      totalAnswered,
      totalParticipants: participantStatus.length,
      allAnswered, // Add this flag for client-side handling
    });
  } catch (error) {
    console.error("Get answer status exception:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
