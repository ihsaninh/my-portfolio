import { supabaseBrowser, supabaseServer } from "./supabase";

// Server-side: publish a broadcast event to room channel with retry logic
export async function publishBattleEvent(params: {
  roomId: string;
  event: string; // e.g., player_joined, room_started, round_revealed, answer_received, round_closed, match_finished
  payload?: Record<string, unknown>;
}) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const supabase = supabaseServer();
      const channel = supabase.channel(`room:${params.roomId}`);

      // Wait for subscription with timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Subscription timeout"));
        }, 5000); // 5 second timeout

        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(new Error(`Subscription failed: ${status}`));
          }
        });
      });

      await channel.send({
        type: "broadcast",
        event: params.event,
        payload: params.payload || {},
      });

      await channel.unsubscribe();

      console.log(`✅ Published ${params.event} to room:${params.roomId}`);
      return; // Success, exit retry loop
    } catch (err) {
      retryCount++;
      console.error(
        `❌ publishBattleEvent failed (attempt ${retryCount}/${
          maxRetries + 1
        }):`,
        {
          roomId: params.roomId,
          event: params.event,
          error: err instanceof Error ? err.message : String(err),
        }
      );

      if (retryCount <= maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
      }
    }
  }

  console.error(
    `💥 publishBattleEvent failed after ${maxRetries + 1} attempts for ${
      params.event
    }`
  );
}

// Client-side helper to create a room channel with enhanced error handling
export function createRoomChannel(roomId: string) {
  const sb = supabaseBrowser;
  if (!sb) {
    console.error("Supabase browser client not available");
    return null;
  }

  try {
    const channel = sb.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: "" },
      },
    });

    // Add connection state logging
    channel.on("system", { event: "*" }, (payload) => {
      console.log(`🔗 Channel system event for room:${roomId}:`, payload.type);
    });

    return channel;
  } catch (err) {
    console.error("Failed to create room channel:", err);
    return null;
  }
}

// Enhanced client-side connection with reconnection logic
export function createEnhancedRoomChannel(
  roomId: string,
  onReconnect?: () => void
) {
  const channel = createRoomChannel(roomId);
  if (!channel) return null;

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  const setupReconnectionLogic = () => {
    channel.on("system", { event: "CHANNEL_ERROR" }, () => {
      console.warn(
        `🔄 Channel error for room:${roomId}, attempting reconnection...`
      );

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              console.log(`✅ Reconnected to room:${roomId}`);
              reconnectAttempts = 0;
              onReconnect?.();
            }
          });
        }, Math.pow(2, reconnectAttempts) * 1000);
      } else {
        console.error(
          `💥 Max reconnection attempts reached for room:${roomId}`
        );
      }
    });
  };

  setupReconnectionLogic();
  return channel;
}
