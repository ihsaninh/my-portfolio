"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FaBolt,
  FaCheck,
  FaClock,
  FaCopy,
  FaCrown,
  FaGamepad,
  FaPlay,
  FaRocket,
  FaStar,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

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
    } | null;
  } | null;
  currentUser?: {
    session_id: string;
    display_name: string;
    is_host: boolean;
    total_score: number;
  };
};

type GamePhase = "waiting" | "playing" | "answering" | "results" | "finished";

type AnswerStatus = {
  participants: Array<{
    session_id: string;
    display_name: string;
    has_answered: boolean;
    is_host: boolean;
  }>;
  currentRound: number | null;
  totalAnswered: number;
  totalParticipants: number;
};

export default function BattleRoom() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roomId = useMemo(() => params?.id, [params]);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>("waiting");
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProgressing, setIsProgressing] = useState(false);
  const [stuckDetectionTimer, setStuckDetectionTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [connectionState, setConnectionState] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());
  const [forceProgressTimer, setForceProgressTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [refreshDebounceTimer, setRefreshDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Data state
  const [state, setState] = useState<StateResp | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus | null>(null);

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev.slice(0, 2)]); // Only keep 3 notifications max
    setTimeout(() => {
      setNotifications((prev) => prev.slice(0, -1));
    }, 3000);
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/battle?roomId=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      addNotification("Room link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const [isHostCache, setIsHostCache] = useState<boolean | null>(null);
  const [tabId] = useState(
    () => `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

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
      if (hasSubmitted) {
        return "results";
      } else {
        return "answering";
      }
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
      if (
        remaining === 0 &&
        isHost() &&
        state.activeRound?.status === "active" &&
        now - deadline > 30000 && // 30 seconds past deadline
        !isProgressing
      ) {
        console.warn("🚨 Force closing round due to extended timeout");
        setIsProgressing(true);
        autoCloseRound();
      }
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
    if (refreshDebounceTimer) {
      clearTimeout(refreshDebounceTimer);
    }

    const timer = setTimeout(() => {
      refresh();
    }, delay);

    setRefreshDebounceTimer(timer);
  };

  // Enhanced refresh function with better error handling and state stability
  async function refresh() {
    try {
      console.log(`🔄 Refreshing state for room ${roomId}`);
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

      if (hasActiveRoundChanged || hasRoomStatusChanged || !state) {
        setState(s);
        console.log(`✅ State updated - Phase: ${currentPhase} -> ${newPhase}`);
      }

      // Update answer status if available
      if (answerStatusResponse.ok) {
        const answerData = await answerStatusResponse.json();
        setAnswerStatus(answerData);
        setAnsweredCount(answerData.totalAnswered);
      }

      // Update game phase only if it actually changed
      if (newPhase !== currentPhase) {
        setGamePhase(newPhase);
        console.log(`🎮 Game phase changed: ${currentPhase} -> ${newPhase}`);
      }

      setLastEventTime(Date.now());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ Refresh error: ${message}`);
      addNotification(`Refresh error: ${message}`);
    }
  }

  useEffect(() => {
    if (!roomId) return;
    refresh();

    // Setup polling backup for critical state updates
    const setupPollingBackup = () => {
      // Clear existing polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Only poll during active phases and less frequently to prevent blinking
      if (
        gamePhase === "answering" ||
        gamePhase === "results" ||
        gamePhase === "playing"
      ) {
        console.log(`🔄 Setting up polling backup for phase: ${gamePhase}`);
        const interval = setInterval(() => {
          const timeSinceLastEvent = Date.now() - lastEventTime;
          // Poll if no events received in last 15 seconds (increased from 10)
          if (timeSinceLastEvent > 15000) {
            console.log("📶 No recent events, polling for updates...");
            refresh();
          }
        }, 8000); // Poll every 8 seconds (increased from 5) to reduce blinking

        setPollingInterval(interval);
      }
    };

    // Setup force progression timer for stuck states
    const setupForceProgressionTimer = () => {
      if (forceProgressTimer) {
        clearTimeout(forceProgressTimer);
      }

      // If we're waiting for round transition for more than 15 seconds, force it
      if (gamePhase === "results" && isHost()) {
        const timer = setTimeout(() => {
          console.warn(
            "⚠️ Force progression timeout - attempting manual state fix"
          );
          refresh();
          // Try to trigger next round or finish match
          const currentRound = state?.activeRound?.roundNo || 0;
          const totalRounds = state?.room?.num_questions || 0;

          if (currentRound >= totalRounds) {
            console.log("🏁 Forcing match finish...");
            // Force redirect to results if this was the last round
            setTimeout(() => {
              router.push(`/battle/result/${roomId}`);
            }, 2000);
          }
        }, 15000); // 15 seconds timeout

        setForceProgressTimer(timer);
      }
    };

    setupPollingBackup();
    setupForceProgressionTimer();

    // Enhanced realtime setup with reconnection
    const ch = createEnhancedRoomChannel(String(roomId), () => {
      console.log("🔗 Reconnected to room channel, refreshing state...");
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
        setGamePhase("playing");
        refresh();
      });

      ch.on("broadcast", { event: "round_revealed" }, (p) => {
        setLastEventTime(Date.now());
        const payload = p?.payload as { roundNo?: number; reason?: string };

        console.log(`🚀 Round revealed event received:`, payload);

        // Reset form state immediately for new round
        setHasSubmitted(false);
        setAnswer("");
        setAnsweredCount(0); // Reset answered count for new round
        setIsProgressing(false); // Reset progression state

        // Clear stuck detection timer since we got the round_revealed event
        if (stuckDetectionTimer) {
          clearTimeout(stuckDetectionTimer);
          setStuckDetectionTimer(null);
        }

        // Clear force progression timer
        if (forceProgressTimer) {
          clearTimeout(forceProgressTimer);
          setForceProgressTimer(null);
        }

        // Set phase first, then refresh to get question data
        setGamePhase("answering");

        // Use debounced refresh to prevent blinking
        debouncedRefresh(500);
      });

      ch.on("broadcast", { event: "answer_received" }, () => {
        setLastEventTime(Date.now());
        // Update answered count and status with debounced refresh to prevent blinking
        debouncedRefresh(1000);
      });

      ch.on("broadcast", { event: "all_participants_answered" }, (p) => {
        setLastEventTime(Date.now());
        const payload = p?.payload as {
          roundNo?: number;
          totalAnswered?: number;
        };
        console.log("🏁 All participants answered event received:", payload);

        // If I'm the host, trigger auto-close after a short delay
        if (isHost()) {
          console.log(
            "🔄 Host triggering auto-close due to all participants answered"
          );
          setTimeout(() => {
            autoCloseRound();
          }, 2000); // 2 second delay to let users see their answers
        }

        refresh();
      });

      ch.on("broadcast", { event: "round_closed" }, (p) => {
        setLastEventTime(Date.now());
        const payload = p?.payload as {
          roundNo?: number;
          reason?: string;
          scoreboard?: Array<{
            sessionId: string;
            displayName: string;
            score: number;
          }>;
        };
        const roundNo = payload?.roundNo || "?";
        const reason = payload?.reason;
        const totalRounds = state?.room?.num_questions || 0;

        console.log(`📊 Round ${roundNo} closed event:`, {
          reason,
          totalRounds,
        });

        if (reason === "all_answered") {
          // addNotification(`🚀 Round ${roundNo} - Next question coming up!`);
        } else {
          // addNotification(`📊 Round ${roundNo} complete!`);
        }

        // Check if this was the last round
        if (Number(roundNo) >= totalRounds) {
          console.log(`🏁 This was the last round (${roundNo}/${totalRounds})`);
          setGamePhase("finished"); // Go directly to finished, not results
          // Don't refresh immediately for last round - wait for match_finished
          return;
        }

        // For non-final rounds, go to results phase temporarily
        setGamePhase("results");

        // Clear any existing stuck detection timer
        if (stuckDetectionTimer) {
          clearTimeout(stuckDetectionTimer);
          setStuckDetectionTimer(null);
        }

        // Start stuck detection timer - if no round_revealed event comes in 10 seconds, mark as stuck
        const timer = setTimeout(() => {
          console.warn(
            `No round_revealed event received after round ${roundNo} closed`
          );
          // Force refresh if stuck
          refresh();
        }, 10000); // 10 seconds timeout
        setStuckDetectionTimer(timer);

        // Minimal refresh delay to prevent blinking
        debouncedRefresh(800);
      });

      ch.on("broadcast", { event: "match_finished" }, () => {
        setLastEventTime(Date.now());
        setIsProgressing(false); // Reset progression state
        setGamePhase("finished");

        // Redirect to final results page after a short delay
        setTimeout(() => {
          router.push(`/battle/result/${roomId}`);
        }, 3000);

        refresh();
      });

      ch.subscribe((status) => {
        console.log(`🔗 Channel subscription status: ${status}`);
        if (status === "SUBSCRIBED") {
          setConnectionState("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("disconnected");
        }
      });

      return () => {
        console.log("🗌 Cleaning up room channel and timers");
        ch.unsubscribe();

        // Enhanced cleanup
        if (pollingInterval) clearInterval(pollingInterval);
        if (stuckDetectionTimer) clearTimeout(stuckDetectionTimer);
        if (forceProgressTimer) clearTimeout(forceProgressTimer);
        if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);

        // Clean up localStorage when leaving the room
        if (localStorage.getItem(`battle_host_tab_${roomId}`) === tabId) {
          localStorage.removeItem(`battle_host_tab_${roomId}`);
          localStorage.removeItem(`battle_host_session_${roomId}`);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Reduced dependencies to prevent excessive re-renders

  async function startBattle() {
    if (!isHost()) {
      addNotification("Only the host can start the battle!");
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
        console.error("Start battle failed:", {
          status: res.status,
          error: data.error,
          currentTab: tabId,
          hostSession: localStorage.getItem(`battle_host_session_${roomId}`),
        });
        throw new Error(data.error || "Failed to start battle");
      }
      addNotification(`🚀 Battle started!`);
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
    if (!answer.trim()) {
      addNotification("Please enter an answer first!");
      return;
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
          body: JSON.stringify({ answer_text: answer }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit answer");

      setHasSubmitted(true);
      // addNotification(`✅ Answer submitted!`);
      setGamePhase("results");
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

    console.log("🔄 Auto-closing round by host...");
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
        console.error(
          "Failed to close round:",
          closeRes.status,
          await closeRes.text()
        );
        setIsProgressing(false);
        return;
      }

      const closeData = await closeRes.json();
      console.log("✅ Round closed successfully:", closeData);

      // Check if this was the last round
      if (currentRound >= totalRounds) {
        console.log(
          "🏁 This was the last round, waiting for match_finished event..."
        );
        // The close API should have set the room status to "finished" and broadcast match_finished
        // If not received within 5 seconds, force transition
        setTimeout(() => {
          if (gamePhase !== "finished") {
            console.warn(
              "⚠️ Match finished event not received, forcing transition..."
            );
            setGamePhase("finished");
            setTimeout(() => {
              router.push(`/battle/result/${roomId}`);
            }, 2000);
          }
        }, 5000);
        return;
      }

      // Small delay before revealing next round
      setTimeout(async () => {
        try {
          const nextRound = currentRound + 1;
          console.log(`🚀 Revealing next round: ${nextRound}`);

          const revealRes = await fetch(
            `/api/battle/rooms/${roomId}/rounds/${nextRound}/reveal`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!revealRes.ok) {
            console.error(
              "Failed to reveal next round:",
              revealRes.status,
              await revealRes.text()
            );
            // Force refresh to get updated state
            refresh();
          } else {
            console.log("✅ Next round revealed successfully");
          }
        } catch (err) {
          console.error("Failed to reveal next round:", err);
          // Force refresh to get updated state
          refresh();
        } finally {
          setIsProgressing(false);
        }
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Auto-close error: ${message}`);
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

  if (!state?.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading battle room...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-10 blur-xl ${
              i % 3 === 0
                ? "bg-gradient-to-br from-purple-400 to-pink-400"
                : i % 3 === 1
                ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                : "bg-gradient-to-br from-emerald-400 to-teal-400"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={`${notification}-${index}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-4 right-4 z-50 bg-purple-600/90 backdrop-blur-xl border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm shadow-lg"
            style={{ top: `${1 + index * 4}rem` }}
          >
            {notification}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/battle"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  ← Back
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    ⚔️ Battle Room
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>ID: {roomId}</span>
                    <span
                      className={`px-2 py-1 rounded-full border text-xs ${getRoomStatusColor(
                        state.room.status
                      )}`}
                    >
                      {state.room.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Connection Status Indicator */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
                    connectionState === "connected"
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : connectionState === "reconnecting"
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connectionState === "connected"
                        ? "bg-green-400 animate-pulse"
                        : connectionState === "reconnecting"
                        ? "bg-yellow-400 animate-spin"
                        : "bg-red-400"
                    }`}
                  />
                  {connectionState}
                </div>

                <button
                  onClick={copyRoomLink}
                  className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-xl transition-all flex items-center gap-2"
                >
                  <FaCopy className="w-4 h-4" />
                  {copied ? "Copied!" : "Share Room"}
                </button>
                <button
                  onClick={refresh}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                >
                  🔄
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Room Info & Participants */}
            <div className="lg:col-span-1 space-y-6">
              {/* Room Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-xl"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaGamepad className="w-5 h-5 text-purple-400" />
                  Room Settings
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Topic:</span>
                    <span className="text-white">
                      {state.room.topic || "General Knowledge"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white">
                      {state.room.language === "id"
                        ? "🇮🇩 Bahasa"
                        : "🇺🇸 English"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questions:</span>
                    <span className="text-white">
                      {state.room.num_questions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time per Round:</span>
                    <span className="text-white">
                      {formatTime(state.room.round_time_sec)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Participants */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-blue-500/30 bg-blue-900/20 p-6 backdrop-blur-xl"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaUsers className="w-5 h-5 text-blue-400" />
                  Players ({state.participants?.length || 0}/
                  {state.room.capacity || 0})
                </h2>
                <div className="space-y-3">
                  {state.participants?.map((participant, index) => {
                    // Find answer status for this participant
                    const participantAnswerStatus =
                      answerStatus?.participants.find(
                        (p) => p.session_id === participant.session_id
                      );

                    return (
                      <motion.div
                        key={participant.session_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          participant.is_host
                            ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {participant.is_host ? (
                            <FaCrown className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <FaGamepad className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-white font-medium">
                            {participant.display_name || "Anonymous Player"}
                          </span>
                          {participant.is_host && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                              HOST
                            </span>
                          )}
                        </div>

                        {/* Answer Status Indicator */}
                        <div className="flex items-center gap-2">
                          {/* Show answer status only during answering or results phases */}
                          {(gamePhase === "answering" ||
                            gamePhase === "results") &&
                            answerStatus &&
                            participantAnswerStatus && (
                              <div className="flex items-center gap-1">
                                {participantAnswerStatus.has_answered ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                                    <FaCheck className="w-3 h-3" />
                                    <span className="text-xs">Answered</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                                    <div className="w-3 h-3 rounded-full border border-gray-400" />
                                    <span className="text-xs">Waiting</span>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Game Area */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl min-h-[600px] flex flex-col"
              >
                {/* Game Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {gamePhase === "waiting" &&
                        "⏳ Waiting for Battle to Start"}
                      {gamePhase === "playing" && "🎮 Battle in Progress"}
                      {gamePhase === "answering" && "📝 Answer the Question"}
                      {gamePhase === "results" && "📊 Waiting for Results"}
                      {gamePhase === "finished" && "🏆 Battle Finished"}
                    </h2>
                    {timeLeft !== null && gamePhase === "answering" && (
                      <div className="flex items-center gap-4">
                        <div
                          className={`px-4 py-2 rounded-xl font-bold text-lg ${
                            timeLeft <= 10
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : timeLeft <= 30
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          <FaClock className="w-4 h-4 inline mr-2" />
                          {formatTime(timeLeft)}
                        </div>

                        {/* Answered Count Indicator */}
                        <div className="px-4 py-2 rounded-xl font-bold text-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <FaUsers className="w-4 h-4 inline mr-2" />
                          {answeredCount}/{state?.participants?.length || 0}{" "}
                          answered
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Content */}
                <div className="flex-1 p-6">
                  {gamePhase === "waiting" && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                      >
                        <FaRocket className="w-10 h-10 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Ready to Battle?
                        </h3>
                        <p className="text-gray-300 mb-6">
                          {isHost()
                            ? "You can start the battle when all players are ready!"
                            : "Waiting for the host to start the battle..."}
                        </p>
                        {isHost() && (
                          <button
                            onClick={startBattle}
                            disabled={loading}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
                          >
                            {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <FaPlay className="w-5 h-5" />
                            )}
                            {loading ? "Starting..." : "Start Battle"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {(gamePhase === "answering" ||
                    (gamePhase === "results" &&
                      state.activeRound?.status === "active")) &&
                    state.activeRound?.question && (
                      <div className="space-y-6">
                        {/* Question */}
                        <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-900/20">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">
                              {state.activeRound.roundNo ===
                              state?.room?.num_questions
                                ? `Final Question (${state.activeRound.roundNo}/${state?.room?.num_questions})`
                                : `Round ${state.activeRound.roundNo}${
                                    state?.room?.num_questions
                                      ? `/${state.room.num_questions}`
                                      : ""
                                  }`}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs border ${getDifficultyColor(
                                  state.activeRound.question.difficulty
                                )}`}
                              >
                                {difficultyLabel(
                                  state.activeRound.question.difficulty,
                                  state.activeRound.question.language
                                )}
                              </span>
                              {state.activeRound.question.category && (
                                <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {state.activeRound.question.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-white text-lg leading-relaxed">
                            {state.activeRound.question.prompt}
                          </p>
                        </div>

                        {/* Answer Input */}
                        {gamePhase === "answering" && !hasSubmitted && (
                          <div className="space-y-4">
                            <textarea
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                              disabled={timeLeft === 0}
                            />
                            <button
                              onClick={submitAnswer}
                              disabled={
                                loading || !answer.trim() || timeLeft === 0
                              }
                              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                            >
                              {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FaBolt className="w-5 h-5" />
                              )}
                              {loading ? "Submitting..." : "Submit Answer"}
                            </button>
                          </div>
                        )}

                        {/* Submitted State */}
                        {hasSubmitted && (
                          <div className="text-center p-6 rounded-2xl bg-green-900/20 border border-green-500/30">
                            <FaStar className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                              Answer Submitted!
                            </h3>
                            <p className="text-green-300">
                              Waiting for other players to finish...
                            </p>

                            {/* Manual Progress Button for Host (Hobby Plan Fallback) */}
                            {isHost() && (
                              <div className="mt-4">
                                <button
                                  onClick={() => {
                                    console.log(
                                      "🔄 Manual progression triggered by host"
                                    );
                                    const currentRound =
                                      state?.activeRound?.roundNo || 0;
                                    const totalRounds =
                                      state?.room?.num_questions || 0;

                                    if (currentRound >= totalRounds) {
                                      // Force finish
                                      router.push(`/battle/result/${roomId}`);
                                    } else {
                                      // Try to progress to next round
                                      autoCloseRound();
                                    }
                                  }}
                                  disabled={isProgressing}
                                  className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 text-orange-300 rounded-xl transition-all flex items-center gap-2 text-sm"
                                >
                                  {isProgressing ? (
                                    <div className="w-4 h-4 border-2 border-orange-300/30 border-t-orange-300 rounded-full animate-spin" />
                                  ) : (
                                    <FaBolt className="w-4 h-4" />
                                  )}
                                  {isProgressing
                                    ? "Processing..."
                                    : "Force Next Round"}
                                </button>
                                <p className="text-xs text-gray-400 mt-1">
                                  Use this if the round doesn&apos;t progress
                                  automatically
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {gamePhase === "finished" && (
                    <div className="text-center space-y-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto"
                      >
                        <FaTrophy className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white">
                        Battle Complete!
                      </h3>
                      <p className="text-gray-300">
                        Redirecting to final results...
                      </p>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"
                      />
                    </div>
                  )}

                  {gamePhase === "playing" && !state.activeRound && (
                    <div className="text-center space-y-4">
                      {isProgressing ? (
                        <>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <FaClock className="w-16 h-16 text-orange-400 mx-auto" />
                          </motion.div>
                          <h3 className="text-xl font-semibold text-white">
                            {state?.room?.num_questions &&
                            state?.room?.status === "active" &&
                            !state.activeRound
                              ? "Calculating Final Results..."
                              : "Preparing Next Round..."}
                          </h3>
                          <p className="text-gray-300">
                            {state?.room?.num_questions &&
                            state?.room?.status === "active" &&
                            !state.activeRound
                              ? "The battle is finishing up. Final scores are being calculated."
                              : "The next question is being prepared automatically."}
                          </p>
                        </>
                      ) : (
                        <>
                          <FaGamepad className="w-16 h-16 text-purple-400 mx-auto" />
                          <h3 className="text-xl font-semibold text-white">
                            Get Ready!
                          </h3>
                          <p className="text-gray-300">
                            The next round is about to begin...
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
