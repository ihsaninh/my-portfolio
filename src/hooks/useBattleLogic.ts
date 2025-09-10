import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { useBattleStore } from "@/src/lib/battle-store";
import { createEnhancedRoomChannel } from "@/src/lib/realtime";

type StateResp = {
  room?: {
    id: string;
    topic?: string;
    language: string;
    num_questions: number;
    round_time_sec: number;
    status: "waiting" | "starting" | "active" | "finished" | "cancelled";
    start_time?: string;
    capacity: number;
  };
  participants?: Array<{
    session_id: string;
    display_name: string;
    is_host: boolean;
    connection_status: string;
    total_score: number;
    participantId?: string;
  }>;
  activeRound?: {
    roundNo: number;
    revealedAt: string;
    deadlineAt: string;
    status: string;
    question?: {
      prompt: string;
      difficulty: number;
      language: string;
      category?: string;
      choices?: Array<{ id: string; text: string }>;
    } | null;
  } | null;
  currentUser?: {
    session_id: string;
    display_name: string;
    is_host: boolean;
    total_score: number;
  };
};

type GamePhase = "waiting" | "playing" | "answering" | "finished";

export function useBattleLogic() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = useMemo(() => params?.id, [params]);

  // Use Zustand store instead of useState hooks
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

    // Data state
    state,
    notifications,
    answeredCount,
    answerStatus,

    // Timer IDs
    stuckDetectionTimerId,
    forceProgressTimerId,
    refreshDebounceTimerId,

    // Actions
    setGamePhase,
    setAnswer,
    setSelectedChoiceId,
    selectedChoiceId,
    setTimeLeft,
    setHasSubmitted,
    setLoading,
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

  const copyRoomLink = () => {
    const link = `${window.location.origin}/battle?roomId=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      addNotification("Room link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Cache host status to localStorage to prevent loss during refreshes
  useEffect(() => {
    if (state?.currentUser?.is_host !== undefined) {
      const hostStatus = state.currentUser.is_host;
      setIsHostCache(hostStatus);

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

        if (hostParticipant) {
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
      if (hostTab === tabId) {
        // Nothing
        setIsHostCache(true);
      } else {
        setIsHostCache(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.currentUser, state?.participants, roomId, tabId, isHostCache]);

  const isHost = () => {
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

  const getGamePhase = (currentState?: StateResp): GamePhase => {
    const stateToUse = currentState || state;
    if (!stateToUse?.room) return "waiting";

    // Check if room is finished first
    if (stateToUse.room.status === "finished") {
      return "finished";
    }

    if (
      stateToUse.room.status === "waiting" ||
      stateToUse.room.status === "starting"
    ) {
      return "waiting";
    }

    // If there's an active round with a question, determine phase based on submission status
    if (
      stateToUse.activeRound?.status === "active" &&
      stateToUse.activeRound?.question
    ) {
      // According to project specs, intermediate scoreboards are completely removed
      // Stay in answering phase even after submission
      return "answering";
    }

    // If room is active but no active round or no question yet, we're in playing phase
    if (stateToUse.room.status === "active") {
      return "playing";
    }

    return "waiting";
  };

  // Timer effect with enhanced timeout for Hobby plan
  useEffect(() => {
    if (!state?.activeRound?.deadlineAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(state.activeRound!.deadlineAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
      setTimeLeft(remaining);

      // Auto-progress when timer reaches zero (only for host)
      // Enhanced for Hobby plan - more aggressive timeout
      if (
        remaining === 0 &&
        isHost() &&
        state.activeRound?.status === "active" &&
        !isProgressing
      ) {
        setIsProgressing(true);
        autoCloseRound();
      }

      // Additional check: if 30 seconds past deadline and host, force close
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state?.activeRound?.deadlineAt,
    state?.activeRound?.status,
    state?.currentUser?.is_host,
    isProgressing,
  ]);

  // Debounced refresh to prevent blinking
  const debouncedRefresh = (delay: number = 300) => {
    // Clear existing timer using store action
    if (refreshDebounceTimerId) {
      clearTimeout(refreshDebounceTimerId);
      setTimerIds({ refreshDebounceTimerId: null });
    }

    const timer = setTimeout(() => {
      refresh();
    }, delay);

    setTimerIds({ refreshDebounceTimerId: timer });
  };

  // Enhanced refresh function with better error handling and state stability
  async function refresh() {
    try {
      const [stateResponse, answerStatusResponse] = await Promise.all([
        fetch(`/api/battle/rooms/${roomId}/state`, {
          credentials: "include", // Ensure cookies are sent
        }),
        fetch(`/api/battle/rooms/${roomId}/answer-status`, {
          credentials: "include",
        }),
      ]);

      if (!stateResponse.ok) {
        throw new Error(`State API returned ${stateResponse.status}`);
      }

      const s = await stateResponse.json();

      // Preserve currentUser data if it's lost but we have it cached
      if (!s?.currentUser && state?.currentUser) {
        s.currentUser = state.currentUser;
      }

      // Prevent unnecessary state updates that cause blinking
      const newPhase = getGamePhase(s);
      const currentPhase = state ? getGamePhase(state) : "waiting";

      // Only update state if there's a meaningful change
      const hasActiveRoundChanged =
        s.activeRound?.roundNo !== state?.activeRound?.roundNo ||
        s.activeRound?.status !== state?.activeRound?.status;

      const hasRoomStatusChanged = s.room?.status !== state?.room?.status;

      // Detect participant list changes (length or membership)
      const haveParticipantsChanged = (() => {
        const prev = state?.participants || [];
        const next = s?.participants || [];
        if (prev.length !== next.length) return true;
        // Compare by session_id to detect joins/leaves/host flag changes
        const prevMap = new Map(prev.map((p) => [p.session_id, p.is_host]));
        for (const n of next) {
          if (!prevMap.has(n.session_id)) return true;
          if (prevMap.get(n.session_id) !== n.is_host) return true;
        }
        return false;
      })();

      if (
        hasActiveRoundChanged ||
        hasRoomStatusChanged ||
        haveParticipantsChanged ||
        !state
      ) {
        setState(s);
      }

      // Update answer status if available
      if (answerStatusResponse.ok) {
        const answerData = await answerStatusResponse.json();
        setAnswerStatus(answerData);
        setAnsweredCount(answerData.totalAnswered);

        // Ensure local submitted state reflects server truth for current user
        try {
          const mySessionId =
            s?.currentUser?.session_id ||
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("quiz_session_id="))
              ?.split("=")[1];
          if (mySessionId && Array.isArray(answerData.participants)) {
            const me = answerData.participants.find(
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

      // Update game phase only if it actually changed
      // Added additional check to prevent setting gamePhase to "finished" inappropriately
      if (
        newPhase !== currentPhase &&
        !(currentPhase === "finished" && newPhase !== "finished")
      ) {
        // Additional check to ensure we don't set gamePhase to "finished" unless the room is actually finished
        if (newPhase === "finished" && s.room?.status !== "finished") {
          // Don't set gamePhase to "finished" if the room is not actually finished
          return;
        }
        setGamePhase(newPhase);
      }

      setLastEventTime(Date.now());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Refresh error: ${message}`);
    }
  }

  // Subscribe to realtime channel once per room
  useEffect(() => {
    if (!roomId) return;
    // Initial fetch once when room mounts
    refresh();

    // Enhanced realtime setup with reconnection (mount once per room)
    const ch = createEnhancedRoomChannel(String(roomId), () => {
      setConnectionState("connected");
      refresh();
    });

    if (ch) {
      setConnectionState("connected");

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
        setGamePhase("playing");
        refresh();
      });

      ch.on("broadcast", { event: "round_revealed" }, () => {
        setLastEventTime(Date.now());

        // Only proceed if room is still active (read fresh store state)
        if (useBattleStore.getState().state?.room?.status !== "active") {
          return;
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
        // Only set game phase if it's not already set to answering
        if (gamePhase !== "answering") {
          setGamePhase("answering");
        }

        // Use debounced refresh to prevent blinking
        debouncedRefresh(500);
      });

      ch.on("broadcast", { event: "answer_received" }, () => {
        setLastEventTime(Date.now());
        // Update answered count and status with debounced refresh to prevent blinking
        debouncedRefresh(1000);
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

        // Start stuck detection timer - if no round_revealed event comes in 10 seconds, mark as stuck
        const timer = setTimeout(() => {
          // Force refresh if stuck
          refresh();
        }, 10000); // 10 seconds timeout
        setTimerIds({ stuckDetectionTimerId: timer });

        // Minimal refresh delay to prevent blinking
        debouncedRefresh(800);
      });

      ch.on("broadcast", { event: "match_finished" }, () => {
        setLastEventTime(Date.now());
        setIsProgressing(false); // Reset progression state

        // Transition to finished immediately on event, then redirect
        if (gamePhase !== "finished") {
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
          setConnectionState("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("disconnected");
        }
      });

      return () => {
        ch.unsubscribe();

        // Enhanced cleanup using store actions
        clearTimers();

        // Clean up localStorage when leaving the room
        if (localStorage.getItem(`battle_host_tab_${roomId}`) === tabId) {
          localStorage.removeItem(`battle_host_tab_${roomId}`);
          localStorage.removeItem(`battle_host_session_${roomId}`);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Lightweight polling backup separated from channel subscription
  useEffect(() => {
    if (!roomId) return;

    if (gamePhase === "answering" || gamePhase === "playing") {
      const interval = setInterval(() => {
        const last = useBattleStore.getState().lastEventTime;
        const timeSinceLastEvent = Date.now() - last;
        if (timeSinceLastEvent > 15000) {
          refresh();
        }
      }, 8000);
      setTimerIds({ pollingIntervalId: interval });
      return () => {
        clearInterval(interval);
        setTimerIds({ pollingIntervalId: null });
      };
    } else {
      // Make sure any existing polling is cleared when not active
      const existing = useBattleStore.getState().pollingIntervalId;
      if (existing) {
        clearInterval(existing);
        setTimerIds({ pollingIntervalId: null });
      }
    }
  }, [roomId, gamePhase]);

  async function startBattle() {
    if (!isHost()) {
      addNotification("Only the host can start the battle!");
      return;
    }

    // Check if battle is already started to prevent duplicate notifications
    if (state?.room?.status === "active" || gamePhase === "playing") {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/battle/rooms/${roomId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add a custom header to help with host identification
          "X-Battle-Host-Tab": tabId,
          "X-Battle-Host-Session":
            localStorage.getItem(`battle_host_session_${roomId}`) || "",
        },
        body: JSON.stringify({ useAI: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start battle");
      }
      // Ensure phase is set to playing after successful start
      setGamePhase("playing");
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Start error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
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

    setLoading(true);
    try {
      const currentRound = state?.activeRound?.roundNo || 1;
      const res = await fetch(
        `/api/battle/rooms/${roomId}/rounds/${currentRound}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            state?.activeRound?.question?.choices?.length
              ? { choice_id: selectedChoiceId }
              : { answer_text: answer }
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer");

      setHasSubmitted(true);
      // According to project specs, intermediate scoreboards are completely removed
      // Stay in answering phase even after submission
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Submit error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function autoCloseRound() {
    if (!isHost() || !state?.activeRound) {
      return;
    }

    setIsProgressing(true);

    try {
      const currentRound = state.activeRound.roundNo;
      const totalRounds = state?.room?.num_questions || 0;

      // Close current round
      const closeRes = await fetch(
        `/api/battle/rooms/${roomId}/rounds/${currentRound}/close`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!closeRes.ok) {
        setIsProgressing(false);
        return;
      }

      await closeRes.json();

      // Check if this was the last round
      if (currentRound >= totalRounds) {
        // The close API should have set the room status to "finished" and broadcast match_finished
        // We'll wait for the match_finished event rather than forcing transition
        return;
      }

      // Small delay before revealing next round
      setTimeout(async () => {
        try {
          const nextRound = currentRound + 1;

          const revealRes = await fetch(
            `/api/battle/rooms/${roomId}/rounds/${nextRound}/reveal`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!revealRes.ok) {
            // Force refresh to get updated state
            refresh();
          }
        } catch {
          // Force refresh to get updated state
          refresh();
        } finally {
          setIsProgressing(false);
        }
      }, 1000);
    } catch {
      setIsProgressing(false);
    }
  }

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

  // Ensure we only redirect once
  const hasRedirectedRef = useRef(false);

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
      hasRedirectedRef.current = true;
      const t = setTimeout(() => {
        router.push(`/battle/result/${roomId}`);
      }, 2500); // Increased delay to 2.5s to ensure users can see the complete message
      return () => clearTimeout(t);
    }
  }, [gamePhase, router, roomId]);

  
  // Ensure phase resets to waiting when entering a fresh room
  useEffect(() => {
    if (state?.room?.status === "waiting" && gamePhase !== "waiting") {
      setGamePhase("waiting");
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
  }, [
    state?.room?.status,
    gamePhase,
    setGamePhase,
    setHasSubmitted,
    setAnswer,
  ]);

  return {
    // State values
    roomId,
    gamePhase,
    timeLeft,
    hasSubmitted,
    loading,
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
