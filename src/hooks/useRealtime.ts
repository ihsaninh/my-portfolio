import { useEffect, useRef } from "react";
import { useDebounceCallback, useInterval } from "usehooks-ts";

import { useBattleStore } from "@/src/lib/battle-store";
import { connectionMonitor } from "@/src/lib/connection-monitor";
import {
  createEnhancedRoomChannel,
  getConnectionStats,
} from "@/src/lib/realtime";
import type { StateResp } from "@/src/types/battle";

export function useRealtime(
  roomId: string | undefined,
  state: StateResp | undefined,
  refresh: () => Promise<void>,
  autoCloseRound: () => Promise<void>
) {
  const {
    gamePhase,
    setGamePhase,
    setLastEventTime,
    setConnectionState,
    setIsProgressing,
    addNotification,
    clearTimers,
    setTimerIds,
    stuckDetectionTimerId,
    forceProgressTimerId,
  } = useBattleStore();

  // Refs for connection state tracking
  const prevConnectionStateRef = useRef<string | null>(null);
  const prevGamePhaseRef = useRef<string | null>(null);

  // Refs for polling
  const pollingBackupCallback = () => {
    const last = useBattleStore.getState().lastEventTime;
    const timeSinceLastEvent = Date.now() - last;

    // Fixed threshold for backup polling
    const threshold = 20000;

    if (timeSinceLastEvent > threshold) {
      console.log(
        `[POLL] Backup polling triggered after ${timeSinceLastEvent}ms inactivity`
      );
      refresh();
    }
  };

  // Run polling backup only when in active game phases
  const shouldRunPolling =
    roomId && (gamePhase === "answering" || gamePhase === "playing");
  const pollingInterval = shouldRunPolling ? 15000 : null; // Base 15 seconds
  useInterval(pollingBackupCallback, pollingInterval);

  // Debounced refresh using useDebounceCallback
  const debouncedRefresh = useDebounceCallback(() => {
    refresh();
  }, 500);

  // Subscribe to realtime channel once per room
  useEffect(() => {
    if (!roomId) return;

    // Log connection stats
    const connectionStats = getConnectionStats();
    console.log(`📊 Connection stats for room:${roomId}`, connectionStats);

    // Start connection monitoring
    connectionMonitor.startMonitoring();

    // Initial fetch once when room mounts
    refresh();

    // Enhanced realtime setup with reconnection
    const ch = createEnhancedRoomChannel(String(roomId), () => {
      if (prevConnectionStateRef.current !== "connected") {
        prevConnectionStateRef.current = "connected";
        setConnectionState("connected");
      }
      refresh();
    });

    // Handle connection errors
    if (!ch) {
      console.error(`❌ Failed to create channel for room:${roomId}`);
      const errorMsg = "Connection error. Please refresh the page.";
      addNotification(errorMsg);
      setConnectionState("disconnected");
      return;
    }

    // Set up error handling for the channel
    let errorCount = 0;
    const maxErrors = 3;

    const handleError = () => {
      errorCount++;

      if (errorCount >= maxErrors) {
        console.error(`💥 Too many connection errors for room:${roomId}`);
        addNotification("Connection unstable. Please refresh the page.");
        setConnectionState("disconnected");
      }
    };

    if (ch) {
      if (prevConnectionStateRef.current !== "connected") {
        prevConnectionStateRef.current = "connected";
        setConnectionState("connected");
      }

      ch.on("broadcast", { event: "player_joined" }, (payload) => {
        const eventSequence = payload?.sequence || Date.now();
        const lastSequence = window.lastEventSequence || 0;

        // Prevent out-of-order event processing
        if (eventSequence < lastSequence) {
          console.warn("[SYNC] Ignoring out-of-order player_joined event:", {
            eventSequence,
            lastSequence,
          });
          return;
        }

        window.lastEventSequence = eventSequence;
        setLastEventTime(Date.now());

        console.log("[SYNC] Processing player_joined event:", {
          sequence: eventSequence,
        });

        // Only refresh, don't clear existing state unnecessarily
        setTimeout(() => {
          refresh().catch((err) => {
            console.error("[SYNC] Player joined refresh failed:", err);
          });
        }, 100);
      });

      ch.on("broadcast", { event: "room_started" }, () => {
        setLastEventTime(Date.now());

        // Transition to playing on room start
        if (prevGamePhaseRef.current !== "playing") {
          prevGamePhaseRef.current = "playing";
          setGamePhase("playing");
        }

        // Clear any existing stuck detection timer
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Set up stuck detection for first round
        const timer = setTimeout(() => {
          refresh();

          // If still stuck after another 10 seconds, try to trigger round generation manually
          const retryTimer = setTimeout(() => {
            if (gamePhase === "playing" && !state?.activeRound) {
              addNotification("Attempting to recover from stuck state...");
              refresh();
            }
          }, 10000);
          setTimerIds({ forceProgressTimerId: retryTimer });
        }, 15000);
        setTimerIds({ stuckDetectionTimerId: timer });

        refresh();
      });

      ch.on("broadcast", { event: "round_revealed" }, (payload) => {
        const eventSequence = payload?.sequence || Date.now();
        const lastSequence = window.lastEventSequence || 0;

        // Prevent out-of-order event processing
        if (eventSequence < lastSequence) {
          console.warn("[SYNC] Ignoring out-of-order round_revealed event:", {
            eventSequence,
            lastSequence,
            roundNo: payload?.payload?.roundNo,
          });
          return;
        }

        window.lastEventSequence = eventSequence;
        setLastEventTime(Date.now());

        const eventRoundNo = payload?.payload?.roundNo;
        console.log("[SYNC] Processing round_revealed event:", {
          sequence: eventSequence,
          roundNo: eventRoundNo,
        });

        // Only proceed if room is still active
        if (useBattleStore.getState().state?.room?.status !== "active") {
          return;
        }

        // Reset form state immediately for new round
        useBattleStore.getState().setHasSubmitted(false);
        useBattleStore.getState().setAnswer("");
        useBattleStore.getState().setSelectedChoiceId(null);
        useBattleStore.getState().setAnsweredCount(0);
        setIsProgressing(false);

        // Clear stuck detection timer
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Clear force progression timer
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
          setTimerIds({ forceProgressTimerId: null });
        }

        // Set phase to answering
        if (prevGamePhaseRef.current !== "answering") {
          prevGamePhaseRef.current = "answering";
          setGamePhase("answering");
        }

        // Use debounced refresh
        debouncedRefresh();
      });

      ch.on("broadcast", { event: "answer_received" }, () => {
        setLastEventTime(Date.now());
        debouncedRefresh();
      });

      ch.on("broadcast", { event: "all_participants_answered" }, () => {
        setLastEventTime(Date.now());

        // If I'm the host, trigger auto-close after a short delay
        const isHost = useBattleStore.getState().isHostCache;
        if (isHost) {
          setTimeout(() => {
            autoCloseRound();
          }, 2000);
        }

        refresh();
      });

      ch.on("broadcast", { event: "round_closed" }, (p) => {
        setLastEventTime(Date.now());
        const roundNo = p?.payload?.roundNo || "?";
        const totalRounds = state?.room?.num_questions || 0;

        // Check if this was the last round
        if (Number(roundNo) >= totalRounds) {
          return;
        }

        // Clear existing timers
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Start stuck detection timer
        const timer = setTimeout(() => {
          refresh();
        }, 12000);
        setTimerIds({ stuckDetectionTimerId: timer });

        debouncedRefresh();
      });

      ch.on("broadcast", { event: "match_finished" }, () => {
        setLastEventTime(Date.now());
        setIsProgressing(false);

        // Transition to finished
        if (prevGamePhaseRef.current !== "finished") {
          prevGamePhaseRef.current = "finished";
          setGamePhase("finished");
        }

        // Clear timers
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        refresh();
      });

      ch.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (prevConnectionStateRef.current !== "connected") {
            prevConnectionStateRef.current = "connected";
            setConnectionState("connected");
          }
          console.log(`✅ Successfully connected to room:${roomId}`);
          errorCount = 0;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`❌ Connection error for room:${roomId}`, err);
          handleError();

          if (prevConnectionStateRef.current !== "disconnected") {
            prevConnectionStateRef.current = "disconnected";
            setConnectionState("disconnected");
            addNotification("Connection lost. Attempting to reconnect...");
          }
        }
      });

      return () => {
        // Enhanced cleanup
        if (ch) {
          ch.unsubscribe()
            .then(() => {
              console.log(`✅ Successfully unsubscribed from room:${roomId}`);
              const connectionStats = getConnectionStats();
              console.log(
                `📊 Connection stats after cleanup for room:${roomId}`,
                connectionStats
              );
            })
            .catch((err) => {
              console.error(`❌ Error unsubscribing from room:${roomId}`, err);
            });
        }

        // Stop connection monitoring
        connectionMonitor.stopMonitoring();

        // Clear timers
        clearTimers();

        // Reset refs
        prevConnectionStateRef.current = null;
        prevGamePhaseRef.current = null;

        // Clean up localStorage
        if (
          roomId &&
          localStorage.getItem(`battle_host_tab_${roomId}`) ===
            useBattleStore.getState().tabId
        ) {
          localStorage.removeItem(`battle_host_tab_${roomId}`);
          localStorage.removeItem(`battle_host_session_${roomId}`);
        }

        // Clear timers
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
        }
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
        }
        clearTimers();
      };
    }
  }, [roomId]);

  return {};
}
