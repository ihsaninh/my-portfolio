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
  roomCode: string;
}

export interface JoinRoomPayload {
  displayName: string;
}

export interface JoinRoomResponse {
  participantId?: string;
  roomId?: string;
  success?: boolean;
  message?: string;
}

export interface RoomAvailabilityResponse {
  roomId: string;
  status: string;
  joinable: boolean;
  capacity?: number | null;
  currentParticipants?: number | null;
  message?: string;
  roomCode?: string;
  meta?: {
    topic?: string | null;
    language?: string | null;
    numQuestions?: number | null;
  };
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
      throw new Error(error.error?.message || "Failed to create room");
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
      throw new Error(error.error?.message || "Failed to join room");
    }

    return response.json();
  },

  checkRoomAvailability: async (
    roomId: string
  ): Promise<RoomAvailabilityResponse> => {
    const response = await fetch(
      `${API_BASE}/rooms/${roomId}/availability`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (error) {
        throw error;
      }
      throw new Error("Failed to check room status");
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
      throw new Error(error.error?.message || "Failed to start battle");
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
      throw new Error(error.error?.message || "Failed to submit answer");
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
      throw new Error(error.error?.message || "Failed to close round");
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
    const name = displayName?.trim();
    if (!name) {
      return false;
    }

    const storageKey = "battle_session_fp";
    const cookieKey = "battle_session_fp";
    let fingerprint: string | null = null;

    if (typeof window !== "undefined") {
      try {
        fingerprint = window.localStorage.getItem(storageKey);
      } catch (err) {
        console.warn("[ensureSession] Unable to access localStorage", err);
      }

      if (!fingerprint && typeof document !== "undefined") {
        const cookieMatch = document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith(`${cookieKey}=`));
        fingerprint = cookieMatch ? cookieMatch.split("=")[1] : null;
      }

      if (!fingerprint) {
        const random =
          typeof window !== "undefined" && "crypto" in window && window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `gen-${Math.random().toString(36).slice(2)}`;
        fingerprint = `fp-${random}`;

        try {
          window.localStorage.setItem(storageKey, fingerprint);
        } catch (err) {
          console.warn(
            "[ensureSession] Failed to persist fingerprint to localStorage",
            err
          );
        }

        if (typeof document !== "undefined") {
          document.cookie = `${cookieKey}=${fingerprint}; path=/; max-age=${60 * 60 * 24 * 30}`;
        }
      }
    }

    const payload: Record<string, unknown> = { display_name: name };
    if (fingerprint) {
      payload.fingerprint_hash = fingerprint;
    }

    const response = await fetch("/api/quiz/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    if (typeof window !== "undefined" && fingerprint) {
      try {
        window.localStorage.setItem(storageKey, fingerprint);
      } catch (err) {
        console.warn(
          "[ensureSession] Failed to persist fingerprint after session creation",
          err
        );
      }

      if (typeof document !== "undefined") {
        document.cookie = `${cookieKey}=${fingerprint}; path=/; max-age=${60 * 60 * 24 * 30}`;
      }
    }

    return true;
  } catch (error) {
    console.error("[ensureSession] Unexpected error", error);
    return false;
  }
};
