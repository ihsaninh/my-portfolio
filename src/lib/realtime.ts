import { RealtimeChannel } from "@supabase/realtime-js";

import { supabaseBrowser, supabaseServer } from "./supabase";

// Connection tracking
interface ConnectionInfo {
  channel: RealtimeChannel;
  userId: string;
  timestamp: number;
  roomId: string;
}

const activeConnections = new Map<string, ConnectionInfo>();
const MAX_CONNECTIONS_PER_USER = 3;

// Event buffering for out-of-order event handling
interface BufferedEvent {
  sequence: number;
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
  processed: boolean;
}

class EventBuffer {
  private buffer = new Map<string, BufferedEvent[]>();
  private maxBufferSize = 50;
  private processingTimeout = 100; // Process buffered events after 100ms
  private processingTimeouts = new Map<string, NodeJS.Timeout>(); // Track processing timeouts

  addEvent(roomId: string, event: BufferedEvent) {
    if (!this.buffer.has(roomId)) {
      this.buffer.set(roomId, []);
    }

    const roomBuffer = this.buffer.get(roomId)!;

    // Prevent buffer overflow
    if (roomBuffer.length >= this.maxBufferSize) {
      console.warn(
        `[BUFFER] Buffer overflow for room ${roomId}, dropping oldest event`
      );
      roomBuffer.shift();
    }

    roomBuffer.push(event);

    // Sort by sequence number
    roomBuffer.sort((a, b) => a.sequence - b.sequence);

    // Clear existing timeout for this room
    const existingTimeout = this.processingTimeouts.get(roomId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Process events in order after a short delay
    const timeout = setTimeout(() => {
      this.processEvents(roomId);
      this.processingTimeouts.delete(roomId); // Clean up after processing
    }, this.processingTimeout);

    this.processingTimeouts.set(roomId, timeout);
  }

  processEvents(roomId: string) {
    const roomBuffer = this.buffer.get(roomId);
    if (!roomBuffer || roomBuffer.length === 0) return;

    // Process events in sequence order
    const unprocessedEvents = roomBuffer.filter((event) => !event.processed);

    for (const event of unprocessedEvents) {
      if (this.canProcessEvent(roomId, event.sequence)) {
        event.processed = true;
        this.emitEvent(roomId, event);
      }
    }

    // Clean up processed events
    const remainingEvents = roomBuffer.filter((event) => !event.processed);
    if (remainingEvents.length === 0) {
      this.buffer.delete(roomId);
    } else {
      this.buffer.set(roomId, remainingEvents);
    }
  }

  private canProcessEvent(roomId: string, sequence: number): boolean {
    const roomBuffer = this.buffer.get(roomId);
    if (!roomBuffer) return true;

    // Check if all previous events have been processed
    const previousEvents = roomBuffer.filter(
      (event) => event.sequence < sequence && !event.processed
    );

    return previousEvents.length === 0;
  }

  private emitEvent(roomId: string, event: BufferedEvent) {
    // Emit the event to registered listeners
    const listeners = eventListeners.get(roomId) || [];
    listeners.forEach((listener) => {
      try {
        listener(event.event, event.payload);
      } catch (err) {
        console.error(
          `[BUFFER] Error in event listener for ${event.event}:`,
          err
        );
      }
    });
  }

  clearBuffer(roomId: string) {
    // Clear any pending processing timeout
    const timeout = this.processingTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.processingTimeouts.delete(roomId);
    }

    this.buffer.delete(roomId);
  }
}

const eventBuffer = new EventBuffer();
const eventListeners = new Map<
  string,
  Array<(event: string, payload: Record<string, unknown>) => void>
>();

// Type for our custom event listeners
type BattleEventListener = (
  event: string,
  payload: Record<string, unknown>
) => void;

// Function to register event listeners for buffered events
export function addBattleEventListener(
  roomId: string,
  listener: BattleEventListener
) {
  if (!eventListeners.has(roomId)) {
    eventListeners.set(roomId, []);
  }
  eventListeners.get(roomId)!.push(listener);
}

// Function to remove event listeners
export function removeBattleEventListener(
  roomId: string,
  listener: BattleEventListener
) {
  const listeners = eventListeners.get(roomId);
  if (listeners) {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    if (listeners.length === 0) {
      eventListeners.delete(roomId);
    }
  }
}

// Server-side: publish a broadcast event to room channel with retry logic
export async function publishBattleEvent(params: {
  roomId: string;
  event: string; // e.g., player_joined, room_started, round_revealed, answer_received, round_closed, match_finished
  payload?: Record<string, unknown>;
}) {
  const maxRetries = 3;
  let retryCount = 0;

  // Add sequence number for event ordering
  const eventPayload = {
    sequence: Date.now(),
    ...params.payload,
  };

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
        payload: eventPayload,
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

  // Log connection stats on failure
  const connectionStats = getConnectionStats();
  console.log(`📊 Connection stats at time of failure:`, connectionStats);
}

// Get user identifier for connection limiting
function getUserId(): string {
  if (typeof window === "undefined") return "server";
  return localStorage.getItem("user_id") || "anonymous";
}

// Client-side helper to create a room channel with enhanced error handling
export function createRoomChannel(roomId: string) {
  try {
    const sb = supabaseBrowser;
    if (!sb) {
      console.error("Supabase browser client not available");
      return null;
    }

    const userId = getUserId();

    // Check connection limit and clean up excess connections
    const userConns = Array.from(activeConnections.entries())
      .filter(([, conn]) => conn.userId === userId)
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    if (userConns.length >= MAX_CONNECTIONS_PER_USER) {
      console.warn(
        `⚠️ Connection limit reached for user ${userId}. Current: ${userConns.length}, Max: ${MAX_CONNECTIONS_PER_USER}`
      );
      // Close oldest connections to make room for new one
      const excess = userConns.length - MAX_CONNECTIONS_PER_USER + 1;
      for (let i = 0; i < excess; i++) {
        const [channelId, conn] = userConns[i];
        console.log(`🔄 Closing excess connection: ${channelId}`);
        try {
          conn.channel.unsubscribe();
          activeConnections.delete(channelId);
        } catch (err) {
          console.error("Error closing excess connection:", err);
        }
      }
    }

    const channel = sb.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: "" },
      },
    });

    // Track this connection
    const channelId = `room:${roomId}`;
    activeConnections.set(channelId, {
      channel,
      userId,
      timestamp: Date.now(),
      roomId,
    });

    // Add connection state logging
    channel.on("system", { event: "*" }, (payload) => {
      console.log(`🔗 Channel system event for room:${roomId}:`, payload.type);
    });

    // Handle channel errors
    channel.on("system", { event: "CHANNEL_ERROR" }, (payload) => {
      console.error(`💥 Channel error for room:${roomId}:`, payload);
    });

    // Clean up on unsubscribe
    const originalUnsubscribe = channel.unsubscribe.bind(channel);
    channel.unsubscribe = async () => {
      activeConnections.delete(channelId);
      console.log(
        `🧹 Cleaned up connection for room:${roomId}. Active connections: ${activeConnections.size}`
      );
      return originalUnsubscribe();
    };

    console.log(
      `🔌 New connection established for room:${roomId}. Total active: ${activeConnections.size}`
    );
    return channel;
  } catch (err) {
    console.error("Failed to create room channel:", err);
    return null;
  }
}

// Enhanced client-side connection with reconnection logic and event buffering
export function createEnhancedRoomChannel(
  roomId: string,
  onReconnect?: () => void
) {
  const channel = createRoomChannel(roomId);
  if (!channel) return null;

  // Set up event buffering for this room
  const bufferedEventHandler = (
    eventType: string,
    payload: Record<string, unknown>
  ) => {
    const sequence = (payload?.sequence as number) || Date.now();

    eventBuffer.addEvent(roomId, {
      sequence,
      event: eventType,
      payload,
      timestamp: Date.now(),
      processed: false,
    });
  };

  // Set up broadcast event listener with buffering
  channel.on("broadcast", { event: "*" }, (payload) => {
    const eventType = payload.event as string;
    bufferedEventHandler(eventType, payload.payload as Record<string, unknown>);
  });

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;
  let isDestroyed = false;
  let connectionTimeout: NodeJS.Timeout | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isReconnecting = false;
  let lastReconnectTime = 0;
  const minReconnectInterval = 5000; // Minimum 5 seconds between reconnection attempts
  const maxReconnectDelay = 30000; // Maximum 30 seconds delay

  // Circuit breaker state
  let circuitBreakerOpen = false;
  let circuitBreakerTimeout: NodeJS.Timeout | null = null;
  const circuitBreakerDuration = 60000; // 1 minute circuit breaker

  // Helper function to attempt reconnection with circuit breaker
  const attemptReconnection = () => {
    if (isDestroyed || isReconnecting || circuitBreakerOpen) {
      return;
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - lastReconnectTime;

    // Enforce minimum interval between reconnection attempts
    if (timeSinceLastAttempt < minReconnectInterval) {
      const waitTime = minReconnectInterval - timeSinceLastAttempt;
      reconnectTimeout = setTimeout(() => attemptReconnection(), waitTime);
      return;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error(
        `💥 Max reconnection attempts (${maxReconnectAttempts}) reached for room:${roomId}`
      );

      // Open circuit breaker
      circuitBreakerOpen = true;
      circuitBreakerTimeout = setTimeout(() => {
        console.log(
          `🔄 Circuit breaker closed for room:${roomId}, allowing reconnection attempts`
        );
        circuitBreakerOpen = false;
        reconnectAttempts = 0; // Reset attempts when circuit breaker closes
      }, circuitBreakerDuration);

      return;
    }

    isReconnecting = true;
    lastReconnectTime = now;
    reconnectAttempts++;

    console.log(
      `🔄 Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts} for room:${roomId}`
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(
          `✅ Reconnected to room:${roomId} on attempt ${reconnectAttempts}`
        );
        reconnectAttempts = 0;
        isReconnecting = false;
        onReconnect?.();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error(
          `❌ Reconnection attempt ${reconnectAttempts} failed for room:${roomId}`
        );
        isReconnecting = false;

        // Schedule next attempt with exponential backoff (capped)
        const delay = Math.min(
          Math.pow(2, reconnectAttempts) * 1000,
          maxReconnectDelay
        );
        reconnectTimeout = setTimeout(() => attemptReconnection(), delay);
      }
    });
  };

  // Set up connection timeout
  connectionTimeout = setTimeout(() => {
    if (!isDestroyed) {
      console.warn(`⏰ Connection timeout for room:${roomId}`);
      attemptReconnection();
    }
  }, 10000); // 10 second timeout

  const setupReconnectionLogic = () => {
    channel.on("system", { event: "CHANNEL_ERROR" }, () => {
      if (isDestroyed) return;

      console.warn(
        `🔄 Channel error for room:${roomId}, attempting reconnection...`
      );

      attemptReconnection();
    });

    // Handle connection close
    channel.on("system", { event: "CLOSED" }, () => {
      if (isDestroyed) return;
      console.log(`🔌 Connection closed for room:${roomId}`);
      // Clear connection timeout when properly closed
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
    });

    // Handle successful subscription
    channel.on("system", { event: "SUBSCRIBED" }, () => {
      // Clear connection timeout when successfully connected
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
    });
  };

  // Enhanced cleanup function
  const originalUnsubscribe = channel.unsubscribe.bind(channel);
  channel.unsubscribe = async () => {
    isDestroyed = true;
    // Clear all timeouts on unsubscribe
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (circuitBreakerTimeout) {
      clearTimeout(circuitBreakerTimeout);
      circuitBreakerTimeout = null;
    }
    return originalUnsubscribe();
  };

  setupReconnectionLogic();
  return channel;
}

// Function to get connection statistics
export function getConnectionStats() {
  const userId = getUserId();
  const userConnections = Array.from(activeConnections.values()).filter(
    (conn: ConnectionInfo) => conn.userId === userId
  ).length;

  return {
    totalConnections: activeConnections.size,
    userConnections,
    maxUserConnections: MAX_CONNECTIONS_PER_USER,
    connectionsByUser: Array.from(activeConnections.values()).reduce(
      (acc: Record<string, number>, conn: ConnectionInfo) => {
        acc[conn.userId] = (acc[conn.userId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

// Function to force cleanup of connections
export function cleanupConnections() {
  const connections = Array.from(activeConnections.entries());
  console.log(`🧹 Cleaning up ${connections.length} connections...`);

  connections.forEach(([channelId, conn]) => {
    try {
      conn.channel.unsubscribe();
      activeConnections.delete(channelId);
    } catch (err) {
      console.error(`❌ Error cleaning up connection ${channelId}:`, err);
    }
  });

  console.log(
    `✅ Cleanup complete. Remaining connections: ${activeConnections.size}`
  );
}
