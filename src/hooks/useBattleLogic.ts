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
import { createEnhancedRoomChannel } from "@/src/lib/realtime";
import type { AnswerStatus, GamePhase, StateResp } from "@/src/types/battle";

// Extend Window interface to include custom properties
declare global {
  interface Window {
    lastRoomChangeTime?: number;
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

  // Detect room change and force reset all state
  useEffect(() => {
    if (roomId && roomId !== lastRoomIdRef.current) {
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

  const { data: state, isLoading: stateLoading } = useRoomState(roomId, {
    enabled: !!roomId,
    refetchInterval: shouldRunPolling ? 8000 : undefined,
  });

  const { data: answerStatus } = useAnswerStatus(roomId, {
    enabled: !!roomId,
    refetchInterval: shouldRunPolling ? 8000 : undefined,
  });

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

      // CRITICAL: Sync gamePhase with server state to prevent desync issues
      const serverGamePhase = determineGamePhaseFromServerState(state);
      if (serverGamePhase !== gamePhase) {
        setGamePhase(serverGamePhase);
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
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((deadline - now) / 1000));

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

  // Enhanced refresh function using TanStack Query
  const refresh = async () => {
    try {
      await refreshBattleData();
      setLastEventTime(Date.now());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Refresh error: ${message}`);
    }
  };

  // Debounced refresh using useDebounceCallback from usehooks-ts (increased delay)
  const debouncedRefresh = useDebounceCallback(refresh, 500);

  // Subscribe to realtime channel once per room (with ref protection for store actions)
  const prevConnectionStateRef = useRef<string | null>(null);
  const prevGamePhaseRef = useRef<GamePhase | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch once when room mounts - critical for page refresh scenarios
    refresh();

    // Enhanced realtime setup with reconnection (mount once per room)
    const ch = createEnhancedRoomChannel(String(roomId), () => {
      if (prevConnectionStateRef.current !== "connected") {
        prevConnectionStateRef.current = "connected";
        setConnectionState("connected");
      }
      refresh();
    });

    if (ch) {
      if (prevConnectionStateRef.current !== "connected") {
        prevConnectionStateRef.current = "connected";
        setConnectionState("connected");
      }

      ch.on("broadcast", { event: "player_joined" }, () => {
        setLastEventTime(Date.now());
        // Only refresh, don't clear existing state unnecessarily
        setTimeout(() => {
          refresh();
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
        setLastEventTime(Date.now());
        const eventRoundNo = payload?.payload?.roundNo;
        // Validate round progression to prevent regression
        const currentLastValid = lastValidRoundRef.current;
        if (
          currentLastValid !== null &&
          eventRoundNo &&
          eventRoundNo < currentLastValid
        ) {
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

      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (prevConnectionStateRef.current !== "connected") {
            prevConnectionStateRef.current = "connected";
            setConnectionState("connected");
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (prevConnectionStateRef.current !== "disconnected") {
            prevConnectionStateRef.current = "disconnected";
            setConnectionState("disconnected");
          }
        }
      });

      return () => {
        ch.unsubscribe();

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
      };
    }
  }, [roomId]);

  // Polling backup using useInterval from usehooks-ts
  const pollingBackupCallback = () => {
    const last = useBattleStore.getState().lastEventTime;
    const timeSinceLastEvent = Date.now() - last;
    if (timeSinceLastEvent > 15000) {
      refresh();
    }
  };

  // Run polling backup only when in active game phases
  useInterval(pollingBackupCallback, shouldRunPolling ? 8000 : null);

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

    try {
      const currentRound = state?.activeRound?.roundNo || 1;
      const payload = state?.activeRound?.question?.choices?.length
        ? { choice_id: selectedChoiceId || undefined }
        : { answer_text: answer };

      await submitAnswerMutation.mutateAsync({
        roomId: roomId!,
        roundNo: currentRound,
        payload,
      });

      setHasSubmitted(true);
      // According to project specs, intermediate scoreboards are completely removed
      // Stay in answering phase even after submission
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Submit error: ${message}`);
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

      return () => clearTimeout(checkTimer);
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
    state,
    notifications,
    answeredCount,
    answerStatus,
    iHaveAnswered,

    // Functions
    copyRoomLink,
    refresh,
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
