export type GamePhase = "waiting" | "playing" | "answering" | "finished";

export type RoomStatus =
  | "waiting"
  | "starting"
  | "active"
  | "finished"
  | "cancelled";

export type ConnectionState = "connected" | "disconnected" | "reconnecting";

export interface BattleRoom {
  id: string;
  topic?: string;
  language: string;
  num_questions: number;
  round_time_sec: number;
  status: RoomStatus;
  start_time?: string;
  capacity: number;
}

export interface BattleParticipant {
  session_id: string;
  display_name: string;
  is_host: boolean;
  connection_status: string;
  total_score: number;
  participantId?: string;
}

export interface BattleCurrentUser {
  session_id: string;
  display_name: string;
  is_host: boolean;
  total_score: number;
}

export interface BattleQuestionChoice {
  id: string;
  text: string;
}

export interface BattleQuestion {
  prompt: string;
  difficulty: number;
  language: string;
  category?: string;
  choices?: BattleQuestionChoice[];
}

export interface BattleActiveRound {
  roundNo: number;
  revealedAt: string;
  deadlineAt: string;
  status: string;
  question?: BattleQuestion | null;
}

export interface StateResp {
  room?: BattleRoom;
  participants?: BattleParticipant[];
  activeRound?: BattleActiveRound | null;
  currentUser?: BattleCurrentUser;
  serverTime?: number;
  clientTimeReceived?: number;
}

export interface AnswerStatus {
  participants: Array<{
    session_id: string;
    display_name: string;
    has_answered: boolean;
    is_host: boolean;
  }>;
  currentRound: number | null;
  totalAnswered: number;
  totalParticipants: number;
}

export interface UserAnswer {
  id: string;
  roundNo: number;
  question: {
    prompt: string;
    difficulty: number;
    language: string;
    category?: string;
  } | null;
  answer: string;
  score: number;
  feedback: string;
  // Optional MCQ fields
  correctAnswer?: string;
  isCorrect?: boolean;
  timeMs?: number | null;
}

export interface UserAnswersResponse {
  roomId: string;
  totalAnswers: number;
  answers: UserAnswer[];
}

export interface FinalScoreEntry {
  session_id: string;
  display_name: string;
  total_score: number;
  is_host?: boolean;
}

export interface ScoreboardEntry {
  sessionId: string;
  displayName: string;
  totalScore: number;
}

export interface RoomStats {
  room?: {
    id: string;
    topic?: string;
    language: string;
    num_questions: number;
    status: string;
  };
  participants?: FinalScoreEntry[];
  currentUser?: {
    session_id: string;
    display_name: string;
    total_score: number;
  };
}

export interface BattleState {
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
  connectionState: ConnectionState;
  connectionError: string | null;
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
  setConnectionState: (connectionState: ConnectionState) => void;
  setConnectionError: (connectionError: string | null) => void;
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
}

export interface GameAreaProps {
  timeLeft: number | null;
  answeredCount: number;
  onStartBattle: () => void;
  onSubmitAnswer: () => void;
  isHost: boolean;
  iHaveAnswered: boolean;
  loading: boolean;
}

export interface WaitingPhaseProps {
  onStartBattle: () => void;
  isHost: boolean;
  loading: boolean;
}

export interface AnsweringPhaseProps {
  onSubmitAnswer: () => void;
  iHaveAnswered: boolean;
  loading: boolean;
}

export interface UserAnswersProps {
  userAnswers: UserAnswer[];
  totalAnswers: number;
  showAnswers: boolean;
  onToggleShowAnswers: () => void;
}

export interface ApiParticipant {
  id: string;
  session_id: string;
  display_name: string;
  is_host: boolean;
  connection_status: string;
  total_score: number;
}
