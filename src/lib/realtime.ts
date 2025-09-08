import { supabaseBrowser, supabaseServer } from "./supabase";

// Server-side: publish a broadcast event to room channel
export async function publishBattleEvent(params: {
  roomId: string;
  event: string; // e.g., player_joined, room_started, round_revealed, answer_received, round_closed, match_finished
  payload?: Record<string, unknown>;
}) {
  try {
    const supabase = supabaseServer();
    const channel = supabase.channel(`room:${params.roomId}`);
    // Subscribe then broadcast, then cleanup
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
      });
    });
    await channel.send({
      type: "broadcast",
      event: params.event,
      payload: params.payload || {},
    });
    await channel.unsubscribe();
  } catch (err) {
    console.error("publishBattleEvent failed", params.event, err);
  }
}

// Client-side helper to create a room channel (guarded)
export function createRoomChannel(roomId: string) {
  const sb = supabaseBrowser;
  if (!sb) return null;
  return sb.channel(`room:${roomId}`);
}
