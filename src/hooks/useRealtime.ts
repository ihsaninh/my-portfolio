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
  refresh: (force?: boolean) => Promise<void>,
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

  // Refs for timeout tracking to prevent memory leaks
  const playerJoinedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const questionLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roundClosedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for polling
  const pollingBackupCallback = () => {
    const last = useBattleStore.getState().lastEventTime;
    const timeSinceLastEvent = Date.now() - last;

    // Fixed threshold for backup polling
    const threshold = 45000;

    if (timeSinceLastEvent > threshold) {
      console.log(
        `[POLL] Backup polling triggered after ${timeSinceLastEvent}ms inactivity`
      );
      refresh(true); // Force refresh for backup polling
    }
  };

  // Run polling backup only when in active game phases
  const shouldRunPolling =
    roomId && (gamePhase === "answering" || gamePhase === "playing");
  const pollingInterval = shouldRunPolling
    ? gamePhase === "answering"
      ? 10000
      : 30000
    : null; // 10 seconds for answering, 30 for playing
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
        if (playerJoinedTimeoutRef.current) {
          clearTimeout(playerJoinedTimeoutRef.current);
        }
        playerJoinedTimeoutRef.current = setTimeout(() => {
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

        // Clear any existing force progress timer
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
          setTimerIds({ forceProgressTimerId: null });
        }

        // Simplified stuck detection - single timer with single retry
        const stuckTimer = setTimeout(() => {
          const currentState = useBattleStore.getState();
          if (
            currentState.gamePhase === "playing" &&
            !currentState.state?.activeRound
          ) {
            console.log(
              "[STUCK] First round not revealed, attempting recovery"
            );
            refresh(true);

            // Single retry after 5 seconds
            const retryTimer = setTimeout(() => {
              const retryState = useBattleStore.getState();
              if (
                retryState.gamePhase === "playing" &&
                !retryState.state?.activeRound
              ) {
                console.log("[STUCK] Recovery failed, forcing refresh");
                addNotification("Attempting to recover from stuck state...");
                refresh(true);
              }
            }, 5000);
            setTimerIds({ forceProgressTimerId: retryTimer });
          }
        }, 10000); // Reduced from 15s to 10s
        setTimerIds({ stuckDetectionTimerId: stuckTimer });

        refresh();
      });

      ch.on("broadcast", { event: "round_revealed" }, (payload) => {
        console.log(
          "[ROUND_REVEALED] Processing event for round:",
          payload?.payload?.roundNo
        );

        // Simplified: Skip sequence checking to reduce complexity
        setLastEventTime(Date.now());

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

        // Clear existing timers
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
          setTimerIds({ forceProgressTimerId: null });
        }
        if (questionLoadTimeoutRef.current) {
          clearTimeout(questionLoadTimeoutRef.current);
        }

        // Set phase to answering
        if (prevGamePhaseRef.current !== "answering") {
          prevGamePhaseRef.current = "answering";
          setGamePhase("answering");
        }

        // Immediate refresh for round transitions
        refresh(true);
        setLastEventTime(Date.now());

        // Single safety timeout for question loading
        questionLoadTimeoutRef.current = setTimeout(() => {
          const currentState = useBattleStore.getState();
          if (
            currentState.gamePhase === "answering" &&
            !currentState.state?.activeRound?.question
          ) {
            console.log("[QUESTION_LOAD] Forcing refresh after delay");
            refresh(true);
          }
        }, 1000);
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
          if (autoCloseTimeoutRef.current) {
            clearTimeout(autoCloseTimeoutRef.current);
          }
          autoCloseTimeoutRef.current = setTimeout(() => {
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

        // Clear existing timers to prevent conflicts
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }
        if (roundClosedTimeoutRef.current) {
          clearTimeout(roundClosedTimeoutRef.current);
        }

        // Simplified round transition timer - single timer, no complex logic
        roundClosedTimeoutRef.current = setTimeout(() => {
          const currentState = useBattleStore.getState();
          if (currentState.gamePhase === "playing") {
            console.log("[ROUND_CLOSED] Round transition timer triggered");
            refresh(true);
          }
        }, 8000); // Reduced from 12s to 8s
        setTimerIds({ stuckDetectionTimerId: roundClosedTimeoutRef.current });

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

        // Clear all tracked timeouts
        if (playerJoinedTimeoutRef.current) {
          clearTimeout(playerJoinedTimeoutRef.current);
          playerJoinedTimeoutRef.current = null;
        }
        if (questionLoadTimeoutRef.current) {
          clearTimeout(questionLoadTimeoutRef.current);
          questionLoadTimeoutRef.current = null;
        }
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
          autoCloseTimeoutRef.current = null;
        }
        if (roundClosedTimeoutRef.current) {
          clearTimeout(roundClosedTimeoutRef.current);
          roundClosedTimeoutRef.current = null;
        }

        // Clear existing timers from store
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
