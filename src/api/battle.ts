import type {
  AnswerStatus,
  RoomStats,
  ScoreboardEntry,
  StateResp,
  UserAnswersResponse,
} from "@/src/types/battle";

const API_BASE = "/api/battle";

export interface CreateRoomPayload {
  hostDisplayName: string;
  topic?: string;
  language: string;
  numQuestions: number;
  roundTimeSec: number;
  capacity: number;
}

export interface CreateRoomResponse {
  roomId: string;
}

export interface JoinRoomPayload {
  displayName: string;
}

export interface JoinRoomResponse {
  success: boolean;
  message?: string;
}

export interface StartBattlePayload {
  useAI: boolean;
}

export interface SubmitAnswerPayload {
  answer_text?: string;
  choice_id?: string;
  timeMs?: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  score?: number;
  feedback?: string;
}

// Room Management APIs
export const battleApi = {
  // Create a new battle room
  createRoom: async (
    payload: CreateRoomPayload
  ): Promise<CreateRoomResponse> => {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create room");
    }

    return response.json();
  },

  // Join an existing battle room
  joinRoom: async (
    roomId: string,
    payload: JoinRoomPayload
  ): Promise<JoinRoomResponse> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join room");
    }

    return response.json();
  },

  // Get room state
  getRoomState: async (roomId: string): Promise<StateResp> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/state`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`State API returned ${response.status}`);
    }

    return response.json();
  },

  // Get answer status for current round
  getAnswerStatus: async (roomId: string): Promise<AnswerStatus> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/answer-status`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Answer status API returned ${response.status}`);
    }

    return response.json();
  },

  // Start battle (host only)
  startBattle: async (
    roomId: string,
    payload: StartBattlePayload,
    headers?: Record<string, string>
  ): Promise<void> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start battle");
    }
  },

  // Submit answer for current round
  submitAnswer: async (
    roomId: string,
    roundNo: number,
    payload: SubmitAnswerPayload
  ): Promise<SubmitAnswerResponse> => {
    const response = await fetch(
      `${API_BASE}/rooms/${roomId}/rounds/${roundNo}/answer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit answer");
    }

    return response.json();
  },

  // Close current round (host only)
  closeRound: async (roomId: string, roundNo: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/rooms/${roomId}/rounds/${roundNo}/close`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to close round");
    }
  },

  // Reveal next round (host only)
  revealNextRound: async (roomId: string, roundNo: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE}/rooms/${roomId}/rounds/${roundNo}/reveal`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reveal next round");
    }
  },

  // Get user's answers for completed battle
  getUserAnswers: async (roomId: string): Promise<UserAnswersResponse> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/my-answers`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user answers");
    }

    return response.json();
  },

  // Get final scoreboard
  getScoreboard: async (
    roomId: string
  ): Promise<{ scoreboard: ScoreboardEntry[] }> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/scoreboard`, {
      cache: "no-store",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch scoreboard");
    }

    return response.json();
  },

  // Get room statistics (for results page)
  getRoomStats: async (roomId: string): Promise<RoomStats> => {
    const response = await fetch(`${API_BASE}/rooms/${roomId}/state`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch room statistics");
    }

    return response.json();
  },
};

// Helper function to ensure session exists
export const ensureSession = async (displayName: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/quiz/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }), // Use display_name instead of displayName
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
};
