import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type GamePhase = "waiting" | "playing" | "answering" | "finished";

type BattleState = {
  // Game state
  gamePhase: GamePhase;
  answer: string;
  timeLeft: number | null;
  hasSubmitted: boolean;
  // For MCQ
  selectedChoiceId?: string | null;
  loading: boolean;
  copied: boolean;
  isProgressing: boolean;
  connectionState: "connected" | "disconnected" | "reconnecting";
  lastEventTime: number;
  isHostCache: boolean | null;
  tabId: string;

  // Data state
  state: StateResp | null;
  notifications: string[];
  answeredCount: number;
  answerStatus: AnswerStatus | null;

  // Timer IDs
  stuckDetectionTimerId: NodeJS.Timeout | null;
  pollingIntervalId: NodeJS.Timeout | null;
  forceProgressTimerId: NodeJS.Timeout | null;
  refreshDebounceTimerId: NodeJS.Timeout | null;

  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setAnswer: (answer: string) => void;
  setTimeLeft: (timeLeft: number | null) => void;
  setHasSubmitted: (hasSubmitted: boolean) => void;
  setSelectedChoiceId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setCopied: (copied: boolean) => void;
  setIsProgressing: (isProgressing: boolean) => void;
  setConnectionState: (
    connectionState: "connected" | "disconnected" | "reconnecting"
  ) => void;
  setLastEventTime: (time: number) => void;
  setIsHostCache: (isHost: boolean | null) => void;
  setState: (state: StateResp | null) => void;
  setNotifications: (notifications: string[]) => void;
  setAnsweredCount: (count: number) => void;
  setAnswerStatus: (status: AnswerStatus | null) => void;
  addNotification: (message: string) => void;
  clearTimers: () => void;
  setTimerIds: (timerIds: {
    stuckDetectionTimerId?: NodeJS.Timeout | null;
    pollingIntervalId?: NodeJS.Timeout | null;
    forceProgressTimerId?: NodeJS.Timeout | null;
    refreshDebounceTimerId?: NodeJS.Timeout | null;
  }) => void;
};

export const useBattleStore = create<BattleState>()(
  persist(
    (set) => ({
      // Initial state
      gamePhase: "waiting",
      answer: "",
      timeLeft: null,
      hasSubmitted: false,
      selectedChoiceId: null,
      loading: false,
      copied: false,
      isProgressing: false,
      connectionState: "disconnected",
      lastEventTime: Date.now(),
      isHostCache: null,
      tabId: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      state: null,
      notifications: [],
      answeredCount: 0,
      answerStatus: null,
      stuckDetectionTimerId: null,
      pollingIntervalId: null,
      forceProgressTimerId: null,
      refreshDebounceTimerId: null,

      // Actions
      setGamePhase: (phase) => set({ gamePhase: phase }),
      setAnswer: (answer) => set({ answer }),
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      setHasSubmitted: (hasSubmitted) => set({ hasSubmitted }),
      setSelectedChoiceId: (id) => set({ selectedChoiceId: id }),
      setLoading: (loading) => set({ loading }),
      setCopied: (copied) => set({ copied }),
      setIsProgressing: (isProgressing) => set({ isProgressing }),
      setConnectionState: (connectionState) => set({ connectionState }),
      setLastEventTime: (lastEventTime) => set({ lastEventTime }),
      setIsHostCache: (isHostCache) => set({ isHostCache }),
      setState: (state) => set({ state }),
      setNotifications: (notifications) => set({ notifications }),
      setAnsweredCount: (answeredCount) => set({ answeredCount }),
      setAnswerStatus: (answerStatus) => set({ answerStatus }),
      addNotification: (message) =>
        set((state) => ({
          notifications: [message, ...state.notifications.slice(0, 2)],
        })),
      clearTimers: () =>
        set((state) => {
          // Clear existing timers
          if (state.stuckDetectionTimerId) {
            clearTimeout(state.stuckDetectionTimerId);
          }
          if (state.pollingIntervalId) {
            clearInterval(state.pollingIntervalId);
          }
          if (state.forceProgressTimerId) {
            clearTimeout(state.forceProgressTimerId);
          }
          if (state.refreshDebounceTimerId) {
            clearTimeout(state.refreshDebounceTimerId);
          }
          return {
            stuckDetectionTimerId: null,
            pollingIntervalId: null,
            forceProgressTimerId: null,
            refreshDebounceTimerId: null,
          };
        }),
      setTimerIds: (timerIds) => set(timerIds),
    }),
    {
      name: "battle-storage",
      partialize: (state) => ({
        isHostCache: state.isHostCache,
        tabId: state.tabId,
      }),
    }
  )
);
