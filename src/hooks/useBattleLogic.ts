/* eslint-disable react-hooks/exhaustive-deps */
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounceCallback, useInterval, useTimeout } from "usehooks-ts";

import {
  useAnswerStatus,
  useBattleRefresh,
  useCloseRound,
  useRevealNextRound,
  useRoomState,
  useStartBattle,
  useSubmitAnswer,
} from "@/src/hooks/useBattleQueries";
import { useBattleStore } from "@/src/lib/battle-store";
import { connectionMonitor } from "@/src/lib/connection-monitor";
import {
  createEnhancedRoomChannel,
  getConnectionStats,
} from "@/src/lib/realtime";
import type { AnswerStatus, GamePhase, StateResp } from "@/src/types/battle";

// Extend Window interface to include custom properties
declare global {
  interface Window {
    lastRoomChangeTime?: number;
    battleStateChecksum?: string;
    lastEventSequence?: number;
  }
}

// Helper function to determine correct gamePhase from server state
function determineGamePhaseFromServerState(state: StateResp): GamePhase {
  if (!state.room) return "waiting";

  switch (state.room.status) {
    case "waiting":
      return "waiting";
    case "finished":
      return "finished";
    case "active":
      // If room is active, check if there's an active round
      if (state.activeRound?.status === "active") {
        return "answering";
      } else {
        return "playing"; // Waiting for round to be revealed
      }
    default:
      return "waiting";
  }
}

// State validation and checksum functions
function generateStateChecksum(state: StateResp): string {
  const keyData = {
    roomId: state.room?.id,
    roomStatus: state.room?.status,
    roundNo: state.activeRound?.roundNo,
    roundStatus: state.activeRound?.status,
    participantCount: state.participants?.length,
    currentUserId: state.currentUser?.session_id,
  };
  return btoa(JSON.stringify(keyData)).slice(0, 16);
}

function validateStateSync(state: StateResp, gamePhase: GamePhase): boolean {
  if (!state.room) return true; // Initial state

  const expectedPhase = determineGamePhaseFromServerState(state);
  const currentChecksum = generateStateChecksum(state);
  const storedChecksum = window.battleStateChecksum;

  // Check for phase mismatch
  if (expectedPhase !== gamePhase) {
    console.warn("[SYNC] Phase mismatch detected:", {
      expected: expectedPhase,
      current: gamePhase,
      state: state.room?.status,
    });
    return false;
  }

  // Check for state drift using checksum
  if (storedChecksum && storedChecksum !== currentChecksum) {
    console.warn("[SYNC] State drift detected:", {
      stored: storedChecksum,
      current: currentChecksum,
    });
    return false;
  }

  return true;
}

function recoverFromStateDesync(roomId: string, refresh: () => Promise<void>) {
  console.log("[SYNC] Initiating state recovery for room:", roomId);

  // Clear local state
  window.battleStateChecksum = undefined;
  window.lastEventSequence = undefined;

  // Force refresh from server
  setTimeout(() => {
    refresh().catch((err) => {
      console.error("[SYNC] Recovery refresh failed:", err);
    });
  }, 1000);
}

export function useBattleLogic() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = useMemo(() => params?.id, [params]);
  const hasRedirectedRef = useRef(false);
  const lastRoomIdRef = useRef<string | undefined>(undefined);

  // Local state for copy timeout
  const [shouldResetCopy, setShouldResetCopy] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Error state for connection issues
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Detect room change and force reset all state
  useEffect(() => {
    if (roomId && roomId !== lastRoomIdRef.current) {
      // Clear any existing connection errors when changing rooms
      setConnectionError(null);

      // Clear TanStack Query cache for previous room to prevent conflicts
      if (lastRoomIdRef.current) {
        queryClient.removeQueries({
          queryKey: ["room-state", lastRoomIdRef.current],
        });
        queryClient.removeQueries({
          queryKey: ["answer-status", lastRoomIdRef.current],
        });
      }

      lastRoomIdRef.current = roomId;

      // Mark the time of room change to prevent immediate redirects
      window.lastRoomChangeTime = Date.now();

      // Only reset state for actual room changes, not page refreshes
      // Page refreshes will get proper state from server via TanStack Query
      if (lastRoomIdRef.current !== undefined) {
        // Force reset all battle state immediately
        const store = useBattleStore.getState();
        store.setGamePhase("waiting");
        store.setHasSubmitted(false);
        store.setAnswer("");
        store.setSelectedChoiceId(null);
        store.setAnsweredCount(0);
        store.setIsProgressing(false);
        store.setState(null);
        store.setAnswerStatus(null);
        store.setNotifications([]);
      }

      // Reset redirect flag
      hasRedirectedRef.current = false;
    }
  }, [roomId, queryClient]);

  // TanStack Query hooks
  const gamePhaseState = useBattleStore.getState().gamePhase;
  const shouldRunPolling =
    roomId && (gamePhaseState === "answering" || gamePhaseState === "playing");

  // Adaptive polling with exponential backoff and connection awareness
  const getAdaptivePollingInterval = () => {
    if (!shouldRunPolling) return undefined;

    // Base interval: 15 seconds for normal operation
    let interval = 15000;

    // Reduce to 8 seconds during active answering phase
    if (gamePhaseState === "answering") {
      interval = 8000;
    }

    // Increase to 30 seconds if connection is unstable
    if (connectionError) {
      interval = 30000;
    }

    // Further reduce frequency if user has been inactive
    const lastActivity = useBattleStore.getState().lastEventTime;
    const timeSinceActivity = Date.now() - lastActivity;
    if (timeSinceActivity > 60000) {
      // 1 minute of inactivity
      interval = Math.min(interval * 2, 60000); // Double interval, max 1 minute
    }

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 2000 - 1000; // ±1 second
    interval += jitter;

    return Math.max(interval, 5000); // Minimum 5 seconds
  };

  const pollingInterval = getAdaptivePollingInterval();

  const { data: state, isLoading: stateLoading } = useRoomState(roomId, {
    enabled: !!roomId,
    refetchInterval: shouldRunPolling ? pollingInterval : undefined,
  });

  const { data: answerStatus } = useAnswerStatus(roomId, {
    enabled: !!roomId,
    refetchInterval: shouldRunPolling ? pollingInterval : undefined,
  });

  // Log polling activity for monitoring
  useEffect(() => {
    if (shouldRunPolling && pollingInterval) {
      console.log(
        `[POLL] Active polling: ${pollingInterval}ms interval, phase: ${gamePhaseState}`
      );
    }
  }, [shouldRunPolling, pollingInterval, gamePhaseState]);

  const { refreshBattleData } = useBattleRefresh(roomId);

  // Mutations
  const startBattleMutation = useStartBattle();
  const submitAnswerMutation = useSubmitAnswer();
  const closeRoundMutation = useCloseRound();
  const revealNextRoundMutation = useRevealNextRound();

  // Reset copy state after 2 seconds using useTimeout
  useTimeout(
    () => {
      setCopied(false);
      setShouldResetCopy(false);
    },
    shouldResetCopy ? 2000 : null
  );

  // Redirect to results after 2.5 seconds using useTimeout
  useTimeout(
    () => {
      router.push(`/battle/result/${roomId}`);
      setShouldRedirect(false);
    },
    shouldRedirect ? 2500 : null
  );

  // Use Zustand store for UI state only
  const {
    // Game state
    gamePhase,
    answer,
    timeLeft,
    hasSubmitted,
    loading,
    copied,
    isProgressing,
    connectionState,
    isHostCache,
    tabId,

    // Zustand state only (not server state)
    notifications,
    answeredCount,

    // Timer IDs
    stuckDetectionTimerId,
    forceProgressTimerId,

    // Actions
    setGamePhase,
    setAnswer,
    setSelectedChoiceId,
    selectedChoiceId,
    setTimeLeft,
    setHasSubmitted,
    setCopied,
    setIsProgressing,
    setConnectionState,
    setLastEventTime,
    setIsHostCache,
    setState,
    setAnsweredCount,
    setAnswerStatus,
    addNotification,
    clearTimers,
    setTimerIds,
  } = useBattleStore();

  // Refs to track previous values and prevent infinite loops
  const prevStateRef = useRef<StateResp | null>(null);
  const prevAnswerStatusRef = useRef<AnswerStatus | null>(null);
  const prevIsHostCacheRef = useRef<boolean | null>(null);
  const prevRoundNoRef = useRef<number | null>(null);
  const lastValidRoundRef = useRef<number | null>(null);

  // Update Zustand store when TanStack Query data changes (with ref protection)
  useEffect(() => {
    if (state && state !== prevStateRef.current) {
      prevStateRef.current = state;
      setState(state);

      // Store client time when state was received for accurate timer calculation
      if (state.serverTime) {
        state.clientTimeReceived = Date.now();
      }

      // Update state checksum for sync validation
      const newChecksum = generateStateChecksum(state);
      window.battleStateChecksum = newChecksum;

      // CRITICAL: Sync gamePhase with server state to prevent desync issues
      const serverGamePhase = determineGamePhaseFromServerState(state);
      if (serverGamePhase !== gamePhase) {
        console.warn("[SYNC] Phase sync triggered:", {
          from: gamePhase,
          to: serverGamePhase,
          reason: "server_state_update",
        });
        setGamePhase(serverGamePhase);
      }

      // Validate state synchronization
      if (!validateStateSync(state, gamePhase)) {
        console.error("[SYNC] State desync detected, initiating recovery");
        recoverFromStateDesync(roomId || "", refresh);
      }

      // CRITICAL: Validate round progression to prevent regression
      const currentRoundNo = state.activeRound?.roundNo;
      if (currentRoundNo !== undefined) {
        const prevRoundNo = prevRoundNoRef.current;
        const lastValidRound = lastValidRoundRef.current;

        // Only accept round progression that moves forward or stays the same
        // Reject any round regression unless it's the initial load
        if (prevRoundNo !== null && lastValidRound !== null) {
          if (currentRoundNo < lastValidRound) {
            // Force refresh to get correct server state
            setTimeout(() => {
              refresh();
            }, 500);
            return;
          }
        }

        // Update tracking refs
        prevRoundNoRef.current = currentRoundNo;
        if (
          lastValidRoundRef.current === null ||
          currentRoundNo >= lastValidRoundRef.current
        ) {
          lastValidRoundRef.current = currentRoundNo;
        }
      }
    }
  }, [state, gamePhase]); // Add gamePhase to dependencies for sync

  useEffect(() => {
    if (answerStatus && answerStatus !== prevAnswerStatusRef.current) {
      prevAnswerStatusRef.current = answerStatus;
      setAnswerStatus(answerStatus);
      setAnsweredCount(answerStatus.totalAnswered);

      // Ensure local submitted state reflects server truth for current user
      try {
        const mySessionId =
          state?.currentUser?.session_id ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("quiz_session_id="))
            ?.split("=")[1];
        if (mySessionId && Array.isArray(answerStatus.participants)) {
          const me = answerStatus.participants.find(
            (p: { session_id: string; has_answered: boolean }) =>
              p.session_id === mySessionId
          );
          if (me?.has_answered) {
            setHasSubmitted(true);
          }
        }
      } catch {
        // ignore mapping issues, UI will still work with local state
      }
    }
  }, [answerStatus, state?.currentUser?.session_id]); // Remove Zustand actions from dependencies

  const copyRoomLink = () => {
    const link = `${window.location.origin}/battle?roomId=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      addNotification("Room link copied to clipboard!");
      setShouldResetCopy(true);
    });
  };

  // Cache host status to localStorage to prevent loss during refreshes (with ref protection)
  useEffect(() => {
    if (state?.currentUser?.is_host !== undefined) {
      const hostStatus = state.currentUser.is_host;
      if (prevIsHostCacheRef.current !== hostStatus) {
        prevIsHostCacheRef.current = hostStatus;
        setIsHostCache(hostStatus);
      }

      if (hostStatus) {
        // Mark this tab as the host tab
        localStorage.setItem(`battle_host_tab_${roomId}`, tabId);
        localStorage.setItem(
          `battle_host_session_${roomId}`,
          state.currentUser.session_id
        );
      }
    } else if (
      isHostCache === null &&
      state?.participants &&
      state.participants.length > 0
    ) {
      // If we don't have currentUser but we have participants, check if any participant with our session is host
      const currentSessionId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("quiz_session_id="))
        ?.split("=")[1];

      if (currentSessionId) {
        const hostParticipant = state?.participants?.find(
          (p) => p.session_id === currentSessionId && p.is_host
        );

        if (hostParticipant && prevIsHostCacheRef.current !== true) {
          prevIsHostCacheRef.current = true;
          setIsHostCache(true);
          localStorage.setItem(`battle_host_tab_${roomId}`, tabId);
          localStorage.setItem(
            `battle_host_session_${roomId}`,
            currentSessionId
          );
        }
      }
    } else if (isHostCache === null) {
      // Check if this tab was the original host tab
      const hostTab = localStorage.getItem(`battle_host_tab_${roomId}`);
      const newHostStatus = hostTab === tabId;
      if (prevIsHostCacheRef.current !== newHostStatus) {
        prevIsHostCacheRef.current = newHostStatus;
        setIsHostCache(newHostStatus);
      }
    }
  }, [state?.currentUser, state?.participants, roomId, tabId, isHostCache]); // Remove setIsHostCache from dependencies

  const isHost = () => {
    // Check for SSR safety
    if (typeof window === "undefined") return false;

    const hostTab = localStorage.getItem(`battle_host_tab_${roomId}`);
    const isCurrentUserHost = state?.currentUser?.is_host;

    // Check if this tab is the designated host tab
    if (hostTab === tabId) {
      return true;
    }

    // Fallback: check current user is host (for initial detection)
    if (isCurrentUserHost) {
      return true;
    }

    // Additional fallback: if we have cached host status for this tab
    if (isHostCache === true) {
      return true;
    }

    return false;
  };

  // Timer logic using useInterval from usehooks-ts (with ref protection)
  const prevTimeLeftRef = useRef<number | null>(null);

  const updateTimer = () => {
    if (!state?.activeRound?.deadlineAt) {
      if (prevTimeLeftRef.current !== null) {
        prevTimeLeftRef.current = null;
        setTimeLeft(null);
      }
      return;
    }

    const deadline = new Date(state.activeRound.deadlineAt).getTime();
    // Use server time for accurate calculation
    const currentServerTime =
      state.serverTime && state.clientTimeReceived
        ? state.serverTime + (Date.now() - state.clientTimeReceived)
        : Date.now();
    const remaining = Math.max(
      0,
      Math.floor((deadline - currentServerTime) / 1000)
    );

    if (prevTimeLeftRef.current !== remaining) {
      prevTimeLeftRef.current = remaining;
      setTimeLeft(remaining);
    }

    // Auto-progress when timer reaches zero (only for host)
    if (
      remaining === 0 &&
      isHost() &&
      state.activeRound?.status === "active" &&
      !isProgressing
    ) {
      setIsProgressing(true);
      autoCloseRound();
    }
  };

  // Use useInterval from usehooks-ts for the timer
  // Only run when there's an active round with a deadline
  const shouldRunTimer = state?.activeRound?.deadlineAt !== undefined;
  useInterval(updateTimer, shouldRunTimer ? 1000 : null);

  // Initial timer update when activeRound changes (with ref protection)
  const prevDeadlineRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentDeadline = state?.activeRound?.deadlineAt;
    if (prevDeadlineRef.current !== currentDeadline) {
      prevDeadlineRef.current = currentDeadline;
      updateTimer();
    }
  }, [state?.activeRound?.deadlineAt]); // Remove updateTimer from dependencies

  // Cleanup refs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      prevStateRef.current = null;
      prevAnswerStatusRef.current = null;
      prevIsHostCacheRef.current = null;
      prevTimeLeftRef.current = null;
      prevDeadlineRef.current = undefined;
      prevRoundNoRef.current = null;
      lastValidRoundRef.current = null;
    };
  }, []);

  // Additional cleanup effect for timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timers to prevent memory leaks
      clearTimers();

      // Clear any remaining timeout refs that might exist
      if (stuckDetectionTimerId) {
        clearTimeout(stuckDetectionTimerId);
      }
      if (forceProgressTimerId) {
        clearTimeout(forceProgressTimerId);
      }

      // Note: useTimeout and useInterval from usehooks-ts handle their own cleanup
      // but we ensure Zustand timers are cleared on unmount
    };
  }, [stuckDetectionTimerId, forceProgressTimerId, clearTimers]);

  // Request deduplication for refresh operations
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(0);

  // Request deduplication for answer submissions
  const submitInProgress = useRef(false);
  const lastSubmitTime = useRef(0);

  // Enhanced refresh function using TanStack Query with deduplication
  const refresh = async () => {
    const now = Date.now();

    // Prevent multiple simultaneous refresh requests
    if (refreshInProgress.current) {
      console.log("[POLL] Refresh already in progress, skipping");
      return;
    }

    // Throttle refresh requests to prevent spam
    if (now - lastRefreshTime.current < 1000) {
      console.log("[POLL] Refresh throttled, too frequent");
      return;
    }

    refreshInProgress.current = true;
    lastRefreshTime.current = now;

    try {
      console.log("[POLL] Executing refresh");
      await refreshBattleData();
      setLastEventTime(now);

      // Validate state after refresh
      if (state) {
        const isValid = validateStateSync(state, gamePhase);
        if (!isValid) {
          console.warn(
            "[SYNC] State validation failed after refresh, attempting recovery"
          );
          // Don't call recoverFromStateDesync here to avoid infinite loop
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[SYNC] Refresh error:", message);
      addNotification(`Refresh error: ${message}`);

      // Trigger recovery on refresh failure
      if (roomId) {
        setTimeout(() => recoverFromStateDesync(roomId, refresh), 2000);
      }
    } finally {
      refreshInProgress.current = false;
    }
  };

  // Manual state recovery function for user-triggered sync
  const forceStateSync = async () => {
    console.log("[SYNC] Manual state sync requested");
    addNotification("Syncing with server...");

    // Clear local state cache
    window.battleStateChecksum = undefined;
    window.lastEventSequence = undefined;

    // Force complete refresh
    try {
      await queryClient.invalidateQueries({ queryKey: ["battle"] });
      await refresh();
      addNotification("State synchronized successfully");
    } catch (err) {
      console.error("[SYNC] Manual sync failed:", err);
      addNotification("Sync failed, please refresh the page");
    }
  };

  // Debounced refresh using useDebounceCallback from usehooks-ts (increased delay)
  const debouncedRefresh = useDebounceCallback(refresh, 500);

  // Subscribe to realtime channel once per room (with ref protection for store actions)
  const prevConnectionStateRef = useRef<string | null>(null);
  const prevGamePhaseRef = useRef<GamePhase | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Log connection stats
    const connectionStats = getConnectionStats();
    console.log(`📊 Connection stats for room:${roomId}`, connectionStats);

    // Start connection monitoring
    connectionMonitor.startMonitoring();

    // Initial fetch once when room mounts - critical for page refresh scenarios
    refresh();

    // Enhanced realtime setup with reconnection (mount once per room)
    const ch = createEnhancedRoomChannel(String(roomId), () => {
      if (prevConnectionStateRef.current !== "connected") {
        prevConnectionStateRef.current = "connected";
        setConnectionState("connected");
        setConnectionError(null); // Clear any previous errors
      }
      refresh();
    });

    // Handle connection errors
    if (!ch) {
      console.error(`❌ Failed to create channel for room:${roomId}`);
      const errorMsg = "Connection error. Please refresh the page.";
      addNotification(errorMsg);
      setConnectionState("disconnected");
      setConnectionError(errorMsg);
      return;
    }

    // Set up error handling for the channel
    let errorCount = 0;
    const maxErrors = 3;

    const handleError = (errorMsg: string) => {
      errorCount++;
      setConnectionError(errorMsg);

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
            // Attempt recovery on refresh failure
            recoverFromStateDesync(roomId, refresh);
          });
        }, 100); // Small delay to ensure server state is updated
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

        // Clear any existing stuck detection timer before setting new one
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
        }

        // Set up stuck detection for first round - if no round_revealed comes in 15 seconds, force refresh
        const timer = setTimeout(() => {
          refresh();

          // If still stuck after another 10 seconds, try to trigger round generation manually
          const retryTimer = setTimeout(() => {
            if (gamePhase === "playing" && !state?.activeRound) {
              addNotification("Attempting to generate round...");
              // Force a more aggressive refresh
              refresh();
            }
          }, 10000);
          setTimerIds({ forceProgressTimerId: retryTimer });
        }, 15000); // 15 seconds timeout for first round
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

        // Validate round progression to prevent regression
        const currentLastValid = lastValidRoundRef.current;
        if (
          currentLastValid !== null &&
          eventRoundNo &&
          eventRoundNo < currentLastValid
        ) {
          console.warn("[SYNC] Round regression detected, ignoring event");
          return;
        }

        // Only proceed if room is still active (read fresh store state)
        if (useBattleStore.getState().state?.room?.status !== "active") {
          return;
        }

        // Update tracking if this is a valid progression
        if (
          eventRoundNo &&
          (currentLastValid === null || eventRoundNo >= currentLastValid)
        ) {
          lastValidRoundRef.current = eventRoundNo;
        }

        // Reset form state immediately for new round
        setHasSubmitted(false);
        setAnswer("");
        setSelectedChoiceId(null);
        setAnsweredCount(0); // Reset answered count for new round
        setIsProgressing(false); // Reset progression state

        // Clear stuck detection timer since we got the round_revealed event
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Clear force progression timer
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
          setTimerIds({ forceProgressTimerId: null });
        }

        // Set phase first, then refresh to get question data
        // Force answering phase for all participants
        if (prevGamePhaseRef.current !== "answering") {
          prevGamePhaseRef.current = "answering";
          setGamePhase("answering");
        }

        // Use debounced refresh to prevent blinking but ensure data is fresh
        debouncedRefresh();
      });

      ch.on("broadcast", { event: "answer_received" }, () => {
        setLastEventTime(Date.now());
        // Update answered count and status with debounced refresh to prevent blinking
        debouncedRefresh();
      });

      ch.on("broadcast", { event: "all_participants_answered" }, () => {
        setLastEventTime(Date.now());

        // If I'm the host, trigger auto-close after a short delay
        if (isHost()) {
          setTimeout(() => {
            autoCloseRound();
          }, 2000); // 2 second delay to let users see their answers
        }

        // According to project specs, intermediate scoreboards are completely removed
        // Stay in answering phase even after all participants have answered
        refresh();
      });

      ch.on("broadcast", { event: "round_closed" }, (p) => {
        setLastEventTime(Date.now());
        const roundNo = p?.payload?.roundNo || "?";
        const totalRounds = state?.room?.num_questions || 0;

        // Validate this isn't a stale event for an older round
        const currentLastValid = lastValidRoundRef.current;
        if (
          currentLastValid !== null &&
          typeof roundNo === "number" &&
          roundNo < currentLastValid
        ) {
          return;
        }

        // Check if this was the last round
        if (Number(roundNo) >= totalRounds) {
          // For the final round, we stay in "playing" phase while waiting for match_finished event
          // Don't refresh immediately for last round - wait for match_finished
          return;
        }

        // For non-final rounds, we stay in "playing" phase while waiting for next round
        // According to project specs, intermediate scoreboards are completely removed
        // Clear any existing stuck detection timer
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Clear any existing stuck detection timer before setting new one
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
        }

        // Start stuck detection timer - if no round_revealed event comes in 12 seconds, mark as stuck
        const timer = setTimeout(() => {
          // Force refresh if stuck
          refresh();
        }, 12000); // 12 seconds timeout (increased from 10s)
        setTimerIds({ stuckDetectionTimerId: timer });

        // Minimal refresh delay to prevent blinking
        debouncedRefresh();
      });

      ch.on("broadcast", { event: "match_finished" }, () => {
        setLastEventTime(Date.now());
        setIsProgressing(false); // Reset progression state

        // Transition to finished immediately on event, then redirect
        if (prevGamePhaseRef.current !== "finished") {
          prevGamePhaseRef.current = "finished";
          setGamePhase("finished");
        }

        // Clear any existing stuck detection timer
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
          setTimerIds({ stuckDetectionTimerId: null });
        }

        // Redirect to final results page after a short delay
        // Central redirect logic - will be handled by the useEffect below

        // Ensure we fetch the final state
        refresh();
      });

      ch.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (prevConnectionStateRef.current !== "connected") {
            prevConnectionStateRef.current = "connected";
            setConnectionState("connected");
            setConnectionError(null); // Clear any previous errors
          }
          console.log(`✅ Successfully connected to room:${roomId}`);
          errorCount = 0; // Reset error count on successful connection
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`❌ Connection error for room:${roomId}`, err);
          const errorMsg =
            err instanceof Error ? err.message : "Connection error";
          handleError(`Connection failed: ${errorMsg}`);

          if (prevConnectionStateRef.current !== "disconnected") {
            prevConnectionStateRef.current = "disconnected";
            setConnectionState("disconnected");
            addNotification("Connection lost. Attempting to reconnect...");
          }
        }
      });

      return () => {
        // Enhanced cleanup with proper error handling
        if (ch) {
          ch.unsubscribe()
            .then(() => {
              console.log(`✅ Successfully unsubscribed from room:${roomId}`);
              // Log connection stats after cleanup
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

        // Enhanced cleanup using store actions
        clearTimers();

        // Reset realtime refs
        prevConnectionStateRef.current = null;
        prevGamePhaseRef.current = null;

        // Clean up localStorage when leaving the room
        if (localStorage.getItem(`battle_host_tab_${roomId}`) === tabId) {
          localStorage.removeItem(`battle_host_tab_${roomId}`);
          localStorage.removeItem(`battle_host_session_${roomId}`);
        }

        // Enhanced cleanup for all timers to prevent memory leaks
        if (stuckDetectionTimerId) {
          clearTimeout(stuckDetectionTimerId);
        }
        if (forceProgressTimerId) {
          clearTimeout(forceProgressTimerId);
        }

        // Clear any additional timers that might be running
        // Note: useTimeout and useInterval from usehooks-ts handle their own cleanup
        // but we ensure Zustand timers are cleared
        clearTimers();
      };
    }
  }, [roomId]);

  // Polling backup using useInterval from usehooks-ts with adaptive timing
  const pollingBackupCallback = () => {
    const last = useBattleStore.getState().lastEventTime;
    const timeSinceLastEvent = Date.now() - last;

    // Adaptive threshold based on connection stability
    const threshold = connectionError ? 30000 : 20000;

    if (timeSinceLastEvent > threshold) {
      console.log(
        `[POLL] Backup polling triggered after ${timeSinceLastEvent}ms inactivity`
      );
      refresh();
    }
  };

  // Run polling backup only when in active game phases with adaptive interval
  const backupPollingInterval = shouldRunPolling
    ? Math.max(pollingInterval || 15000, 10000)
    : null;
  useInterval(pollingBackupCallback, backupPollingInterval);

  const startBattle = async () => {
    if (!isHost()) {
      addNotification("Only the host can start the battle!");
      return;
    }

    // Check if battle is already started to prevent duplicate notifications
    if (state?.room?.status === "active" || gamePhase === "playing") {
      return;
    }

    try {
      await startBattleMutation.mutateAsync({
        roomId: roomId!,
        payload: { useAI: true },
        headers: {
          "X-Battle-Host-Tab": tabId,
          "X-Battle-Host-Session":
            localStorage.getItem(`battle_host_session_${roomId}`) || "",
        },
      });

      // Ensure phase is set to playing after successful start
      setGamePhase("playing");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Start error: ${message}`);
    }
  };

  const submitAnswer = async () => {
    const hasChoices = !!state?.activeRound?.question?.choices?.length;
    if (hasChoices) {
      if (!useBattleStore.getState().selectedChoiceId) {
        addNotification("Please select an option first!");
        return;
      }
    } else {
      if (!answer.trim()) {
        addNotification("Please enter an answer first!");
        return;
      }
    }

    if (hasSubmitted) {
      addNotification("You've already submitted for this round!");
      return;
    }

    // Prevent multiple simultaneous submissions
    if (submitInProgress.current) {
      console.log("[SUBMIT] Submission already in progress, skipping");
      return;
    }

    // Throttle submissions to prevent spam
    const now = Date.now();
    if (now - lastSubmitTime.current < 1000) {
      console.log("[SUBMIT] Submission throttled, too frequent");
      addNotification("Please wait before submitting again");
      return;
    }

    submitInProgress.current = true;
    lastSubmitTime.current = now;

    // Store original state for potential rollback
    const originalHasSubmitted = hasSubmitted;
    const originalAnswer = answer;
    const originalSelectedChoiceId = selectedChoiceId ?? null;

    // Optimistic update - immediately show as submitted
    setHasSubmitted(true);
    setAnswer(""); // Clear input
    setSelectedChoiceId(null); // Clear selection

    // Add loading indicator
    setIsProgressing(true);

    try {
      const currentRound = state?.activeRound?.roundNo || 1;
      const payload = hasChoices
        ? { choice_id: originalSelectedChoiceId || undefined }
        : { answer_text: originalAnswer };

      await submitAnswerMutation.mutateAsync({
        roomId: roomId!,
        roundNo: currentRound,
        payload,
      });

      // Success - refresh to get updated state
      await refresh();
    } catch (err) {
      // Rollback optimistic updates on failure
      console.error("[SUBMIT] Answer submission failed, rolling back:", err);
      setHasSubmitted(originalHasSubmitted);
      setAnswer(originalAnswer);
      setSelectedChoiceId(originalSelectedChoiceId);

      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Failed to submit answer: ${message}`);

      // Add retry option for network errors
      if (message.includes("network") || message.includes("timeout")) {
        setTimeout(() => {
          addNotification("Network error - you can try submitting again");
        }, 3000);
      }
    } finally {
      setIsProgressing(false);
      submitInProgress.current = false;
    }
  };

  const autoCloseRound = async () => {
    if (!isHost() || !state?.activeRound) {
      return;
    }

    // Prevent multiple simultaneous close attempts
    if (isProgressing) {
      return;
    }

    setIsProgressing(true);

    try {
      const currentRound = state.activeRound.roundNo;
      const totalRounds = state?.room?.num_questions || 0;

      // Close current round
      await closeRoundMutation.mutateAsync({
        roomId: roomId!,
        roundNo: currentRound,
      });

      // Check if this was the last round
      if (currentRound >= totalRounds) {
        // The close API should have set the room status to "finished" and broadcast match_finished
        // We'll wait for the match_finished event rather than forcing transition
        return;
      }

      // Small delay before revealing next round to prevent race conditions
      setTimeout(async () => {
        try {
          const nextRound = currentRound + 1;

          await revealNextRoundMutation.mutateAsync({
            roomId: roomId!,
            roundNo: nextRound,
          });

          // Update tracking for the new round
          lastValidRoundRef.current = nextRound;
        } catch {
          // Force refresh to get updated state
          await refresh();
        } finally {
          setIsProgressing(false);
        }
      }, 1500); // Increased delay from 1000ms to 1500ms
    } catch {
      setIsProgressing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const difficultyLabel = (difficulty: number, language: string) => {
    if (language === "id") {
      return difficulty === 1 ? "Mudah" : difficulty === 3 ? "Sulit" : "Sedang";
    }
    return difficulty === 1 ? "Easy" : difficulty === 3 ? "Hard" : "Medium";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return "text-green-400";
    if (difficulty === 3) return "text-red-400";
    return "text-yellow-400";
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "finished":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Compute whether server already recorded my answer (to avoid UI flicker)
  const mySessionId = useMemo(() => {
    return (
      state?.currentUser?.session_id ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("quiz_session_id="))
        ?.split("=")[1] ||
      null
    );
  }, [state?.currentUser?.session_id]);

  const serverMarkedAnswered = useMemo(() => {
    if (!answerStatus?.participants || !mySessionId) return null;
    const me = answerStatus.participants.find(
      (p: { session_id: string; has_answered: boolean }) =>
        p.session_id === mySessionId
    );
    return me?.has_answered ?? null;
  }, [answerStatus?.participants, mySessionId]);

  const iHaveAnswered = hasSubmitted || serverMarkedAnswered === true;

  // Redirect when gamePhase becomes finished (most robust trigger)
  useEffect(() => {
    if (gamePhase === "finished" && !hasRedirectedRef.current) {
      // Additional safety: don't redirect if we just entered a new room
      const timeSinceRoomChange =
        lastRoomIdRef.current === roomId
          ? Date.now() - (window.lastRoomChangeTime || 0)
          : 5000;
      if (timeSinceRoomChange > 3000) {
        // Wait at least 3 seconds after room change
        hasRedirectedRef.current = true;
        setShouldRedirect(true);
      }
    }
  }, [gamePhase, roomId]);

  // Ensure phase resets to waiting when entering a fresh room (with ref protection)
  // Only apply this logic for rooms that are actually in waiting status
  useEffect(() => {
    if (state?.room?.status === "waiting" && gamePhase !== "waiting") {
      // Only reset if server confirms room is in waiting status
      if (prevGamePhaseRef.current !== "waiting") {
        prevGamePhaseRef.current = "waiting";
        setGamePhase("waiting");
      }
      setHasSubmitted(false);
      setAnswer("");
      try {
        // Optional: clear MCQ selection if present
        if (
          typeof useBattleStore.getState().setSelectedChoiceId === "function"
        ) {
          useBattleStore.getState().setSelectedChoiceId(null);
        }
      } catch {}
    }
  }, [state?.room?.status, gamePhase]);

  // Additional sync logic for active rooms to ensure proper phase transitions
  useEffect(() => {
    if (state?.room?.status === "active") {
      // Room is active, determine correct phase
      const correctPhase = determineGamePhaseFromServerState(state);
      if (gamePhase !== correctPhase) {
        setGamePhase(correctPhase);
      }
    }
  }, [state?.room?.status, state?.activeRound, gamePhase]);

  // Note: Additional roomId-based reset is handled at the top of the function

  // Detect stuck "playing" phase and provide recovery
  useEffect(() => {
    if (
      gamePhase === "playing" &&
      state?.room?.status === "active" &&
      !state?.activeRound &&
      isHost()
    ) {
      // If we're in playing phase, room is active, but no active round exists
      // This might indicate the first round generation failed
      const checkTimer = setTimeout(() => {
        addNotification("Attempting to recover from stuck state...");
        refresh();
      }, 20000); // 20 second check

      // Store the timer ID for cleanup
      // Note: This is a simple case where we just clear on cleanup
      return () => {
        clearTimeout(checkTimer);
      };
    }
  }, [gamePhase, state?.room?.status, state?.activeRound, isHost]);

  return {
    // State values
    roomId,
    gamePhase,
    timeLeft,
    hasSubmitted,
    loading:
      loading ||
      stateLoading ||
      startBattleMutation.isPending ||
      submitAnswerMutation.isPending,
    copied,
    isProgressing,
    connectionState,
    connectionError,
    state,
    notifications,
    answeredCount,
    answerStatus,
    iHaveAnswered,

    // Functions
    copyRoomLink,
    refresh,
    forceStateSync,
    startBattle,
    submitAnswer,
    autoCloseRound,
    formatTime,
    difficultyLabel,
    getDifficultyColor,
    getRoomStatusColor,

    // Derived values
    isHost: isHost(),
  };
}
