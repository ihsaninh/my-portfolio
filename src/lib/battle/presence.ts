import { publishBattleEvent } from "@/src/lib/battle/realtime";
import { supabaseAdmin } from "@/src/lib/services/supabase";

interface StatusChange {
  sessionId: string;
  status: "online" | "offline";
}

interface PresenceUpdateResult {
  hostChanged?: {
    sessionId: string;
    displayName: string;
  } | null;
  battleFinished?: {
    reason: string;
    winnerSessionId: string | null;
  } | null;
  markedOffline?: string[];
  statusChanges?: StatusChange[];
}

const OFFLINE_THRESHOLD_MS = 12_000;

type ParticipantRecord = {
  id: string;
  session_id: string;
  display_name: string;
  is_host: boolean;
  connection_status: string;
  total_score: number;
  joined_at: string | null;
  last_seen_at: string | null;
};

async function closeRoundAndAdvance(params: {
  supabase: ReturnType<typeof supabaseAdmin>;
  roomId: string;
  roundId: string;
  roundNo: number;
  roundTimeSec: number;
}): Promise<{
  reason: string;
  winnerSessionId: string | null;
} | null> {
  const { supabase, roomId, roundId, roundNo, roundTimeSec } = params;

  const { data: roundStatus } = await supabase
    .from("battle_room_rounds")
    .select("status")
    .eq("id", roundId)
    .single();

  if (!roundStatus || roundStatus.status === "closed") {
    return null;
  }

  await supabase
    .from("battle_room_rounds")
    .update({ status: "closed" })
    .eq("id", roundId);

  const { data: answers } = await supabase
    .from("battle_room_answers")
    .select("session_id, score_final")
    .eq("round_id", roundId);

  if (answers && answers.length > 0) {
    for (const answer of answers) {
      const { data: existing } = await supabase
        .from("battle_room_participants")
        .select("total_score")
        .eq("room_id", roomId)
        .eq("session_id", answer.session_id)
        .single();

      const updatedScore =
        (existing?.total_score || 0) + (answer.score_final || 0);

      await supabase
        .from("battle_room_participants")
        .update({ total_score: updatedScore })
        .eq("room_id", roomId)
        .eq("session_id", answer.session_id);
    }
  }

  const { data: participantsForMap } = await supabase
    .from("battle_room_participants")
    .select("session_id, display_name, id")
    .eq("room_id", roomId);

  const nameMap = new Map(
    (participantsForMap || []).map((p) => [
      p.session_id,
      {
        displayName: p.display_name,
        participantId: p.id,
      },
    ])
  );

  const scoreboard = (answers || []).map((answer) => {
    const mapped = nameMap.get(answer.session_id);
    return {
      sessionId: answer.session_id,
      displayName: mapped?.displayName || "Player",
      participantId: mapped?.participantId,
      score: answer.score_final || 0,
    };
  });

  await publishBattleEvent({
    roomId,
    event: "round_closed",
    payload: { roundNo, scoreboard },
  });

  const { count: remainingRounds } = await supabase
    .from("battle_room_rounds")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId)
    .neq("status", "closed");

  if (!remainingRounds || remainingRounds === 0) {
    const { data: standingsData } = await supabase
      .from("battle_room_participants")
      .select("session_id, display_name, total_score, is_host")
      .eq("room_id", roomId);

    await supabase
      .from("battle_rooms")
      .update({ status: "finished", finished_reason: "rounds_completed" })
      .eq("id", roomId);

    const winner = (standingsData || [])
      .slice()
      .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))[0];

    await publishBattleEvent({
      roomId,
      event: "match_finished",
      payload: {
        roomId,
        reason: "rounds_completed",
        winnerSessionId: winner?.session_id || null,
        standings: standingsData,
      },
    });

    return {
      reason: "rounds_completed",
      winnerSessionId: winner?.session_id || null,
    };
  }

  const { data: nextRound } = await supabase
    .from("battle_room_rounds")
    .select("id, round_no")
    .eq("room_id", roomId)
    .eq("status", "pending")
    .gt("round_no", roundNo)
    .order("round_no", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextRound) {
    const now = new Date();
    const deadline = new Date(now.getTime() + roundTimeSec * 1000);

    await supabase
      .from("battle_room_rounds")
      .update({
        status: "active",
        revealed_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
      })
      .eq("id", nextRound.id);

    await publishBattleEvent({
      roomId,
      event: "round_revealed",
      payload: {
        roundNo: nextRound.round_no,
        revealedAt: now.toISOString(),
        deadlineAt: deadline.toISOString(),
        reason: "auto_progress",
      },
    });
  }

  return null;
}

export async function handlePresenceUpdate(params: {
  roomId: string;
  sessionId: string;
  status: "online" | "offline";
}): Promise<PresenceUpdateResult> {
  const supabase = supabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: currentParticipant, error: currentErr } = await supabase
    .from("battle_room_participants")
    .select("connection_status")
    .eq("room_id", params.roomId)
    .eq("session_id", params.sessionId)
    .maybeSingle();

  if (currentErr) {
    throw currentErr;
  }

  const statusChanges = new Map<string, "online" | "offline">();

  const { error: updateErr } = await supabase
    .from("battle_room_participants")
    .update({
      connection_status: params.status,
      last_seen_at: nowIso,
    })
    .eq("room_id", params.roomId)
    .eq("session_id", params.sessionId);

  if (updateErr) {
    throw updateErr;
  }

  if (
    !currentParticipant ||
    currentParticipant.connection_status !== params.status
  ) {
    statusChanges.set(params.sessionId, params.status);
  }

  const { data: room, error: roomErr } = await supabase
    .from("battle_rooms")
    .select(
      "id, status, host_session_id, finished_reason, winner_session_id, round_time_sec"
    )
    .eq("id", params.roomId)
    .single();

  if (roomErr || !room) {
    throw roomErr || new Error("ROOM_NOT_FOUND");
  }

  const { data: participantRows, error: participantsErr } = await supabase
    .from("battle_room_participants")
    .select(
      "id, session_id, display_name, is_host, connection_status, total_score, joined_at, last_seen_at"
    )
    .eq("room_id", params.roomId);

  if (participantsErr || !participantRows) {
    throw participantsErr || new Error("PARTICIPANTS_NOT_FOUND");
  }

  const participants = participantRows as ParticipantRecord[];
  const markedOffline: string[] = [];

  const thresholdTime = new Date(now.getTime() - OFFLINE_THRESHOLD_MS);

  const staleSessions = participants
    .filter((p) => {
      if (p.connection_status !== "online") return false;
      if (!p.last_seen_at) return true;
      const seen = new Date(p.last_seen_at);
      return seen < thresholdTime;
    })
    .map((p) => p.session_id);

  if (staleSessions.length > 0) {
    const { error: staleUpdateErr } = await supabase
      .from("battle_room_participants")
      .update({ connection_status: "offline" })
      .eq("room_id", params.roomId)
      .in("session_id", staleSessions);

    if (!staleUpdateErr) {
      markedOffline.push(...staleSessions);
      staleSessions.forEach((sessionId) => {
        statusChanges.set(sessionId, "offline");
      });
      participants.forEach((p) => {
        if (staleSessions.includes(p.session_id)) {
          p.connection_status = "offline";
        }
      });
    }
  }

  const result: PresenceUpdateResult = {};

  const onlineParticipants = participants.filter(
    (p) => p.connection_status === "online"
  );

  const { data: activeRound } = await supabase
    .from("battle_room_rounds")
    .select("id, round_no")
    .eq("room_id", params.roomId)
    .eq("status", "active")
    .order("round_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeRound && onlineParticipants.length > 0) {
    const { data: answers } = await supabase
      .from("battle_room_answers")
      .select("session_id")
      .eq("round_id", activeRound.id);

    const answeredSet = new Set((answers || []).map((a) => a.session_id));
    const answeredCount = onlineParticipants.filter((p) =>
      answeredSet.has(p.session_id)
    ).length;

    if (answeredCount === onlineParticipants.length) {
      await publishBattleEvent({
        roomId: params.roomId,
        event: "all_participants_answered",
        payload: {
          roundNo: activeRound.round_no,
          totalAnswered: answeredCount,
          totalParticipants: onlineParticipants.length,
          reason: "presence_sync",
        },
      });

      const closeResult = await closeRoundAndAdvance({
        supabase,
        roomId: params.roomId,
        roundId: activeRound.id,
        roundNo: activeRound.round_no,
        roundTimeSec: room.round_time_sec || 60,
      });

      if (closeResult) {
        result.battleFinished = {
          reason: closeResult.reason,
          winnerSessionId: closeResult.winnerSessionId,
        };
      }
    }
  }

  const hostParticipant = participants.find(
    (p) => p.session_id === room.host_session_id
  );
  const shouldReassignHost =
    !!hostParticipant && hostParticipant.connection_status !== "online";

  if (shouldReassignHost && onlineParticipants.length > 0) {
    const sortedByJoin = [...onlineParticipants].sort((a, b) => {
      const aJoined = a.joined_at ? new Date(a.joined_at).getTime() : 0;
      const bJoined = b.joined_at ? new Date(b.joined_at).getTime() : 0;
      if (aJoined === bJoined) {
        return b.total_score - a.total_score;
      }
      return aJoined - bJoined;
    });

    const newHost = sortedByJoin[0];

    if (newHost && newHost.session_id !== room.host_session_id) {
      await supabase
        .from("battle_room_participants")
        .update({ is_host: false })
        .eq("room_id", params.roomId)
        .eq("is_host", true);

      await supabase
        .from("battle_room_participants")
        .update({ is_host: true })
        .eq("room_id", params.roomId)
        .eq("session_id", newHost.session_id);

      await supabase
        .from("battle_rooms")
        .update({ host_session_id: newHost.session_id })
        .eq("id", params.roomId);

      await publishBattleEvent({
        roomId: params.roomId,
        event: "host_changed",
        payload: {
          sessionId: newHost.session_id,
          displayName: newHost.display_name,
        },
      });

      result.hostChanged = {
        sessionId: newHost.session_id,
        displayName: newHost.display_name,
      };
    }
  }

  if (room.status === "active" && onlineParticipants.length <= 1) {
    const winnerSessionId =
      onlineParticipants.length === 1 ? onlineParticipants[0].session_id : null;

    await supabase
      .from("battle_rooms")
      .update({
        status: "finished",
        finished_reason: "opponent_disconnected",
        winner_session_id: winnerSessionId,
      })
      .eq("id", params.roomId);

    const { data: standings } = await supabase
      .from("battle_room_participants")
      .select("session_id, display_name, total_score, is_host")
      .eq("room_id", params.roomId);

    await publishBattleEvent({
      roomId: params.roomId,
      event: "match_finished",
      payload: {
        roomId: params.roomId,
        reason: "opponent_disconnected",
        winnerSessionId,
        standings,
      },
    });

    result.battleFinished = {
      reason: "opponent_disconnected",
      winnerSessionId,
    };
  }

  if (markedOffline.length) {
    result.markedOffline = markedOffline;
  }

  if (statusChanges.size > 0) {
    const changes: StatusChange[] = Array.from(statusChanges.entries()).map(
      ([sessionId, status]) => ({
        sessionId,
        status,
      })
    );

    await publishBattleEvent({
      roomId: params.roomId,
      event: "participant_status",
      payload: { changes },
    });

    result.statusChanges = changes;
  }

  return result;
}
