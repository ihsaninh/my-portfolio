import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  battleApi,
  type CreateRoomPayload,
  ensureSession,
  type JoinRoomPayload,
  type StartBattlePayload,
  type SubmitAnswerPayload,
} from "@/src/api/battle";
import { handleApiError } from "@/src/lib/client-error-handler";

// Query Keys
export const battleQueryKeys = {
  all: ["battle"] as const,
  rooms: () => [...battleQueryKeys.all, "rooms"] as const,
  room: (roomId: string) => [...battleQueryKeys.rooms(), roomId] as const,
  roomState: (roomId: string) =>
    [...battleQueryKeys.room(roomId), "state"] as const,
  answerStatus: (roomId: string) =>
    [...battleQueryKeys.room(roomId), "answer-status"] as const,
  userAnswers: (roomId: string) =>
    [...battleQueryKeys.room(roomId), "user-answers"] as const,
  scoreboard: (roomId: string) =>
    [...battleQueryKeys.room(roomId), "scoreboard"] as const,
};

// Room State Query
export const useRoomState = (
  roomId: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery({
    queryKey: battleQueryKeys.roomState(roomId || ""),
    queryFn: () => battleApi.getRoomState(roomId!),
    enabled: !!roomId && options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    staleTime: 0,
    gcTime: 0,
  });
};

// Answer Status Query
export const useAnswerStatus = (
  roomId: string | undefined,
  options?: { enabled?: boolean; refetchInterval?: number }
) => {
  return useQuery({
    queryKey: battleQueryKeys.answerStatus(roomId || ""),
    queryFn: () => battleApi.getAnswerStatus(roomId!),
    enabled: !!roomId && options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    staleTime: 0,
    gcTime: 0,
  });
};

// User Answers Query
export const useUserAnswers = (
  roomId: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: battleQueryKeys.userAnswers(roomId || ""),
    queryFn: () => battleApi.getUserAnswers(roomId!),
    enabled: !!roomId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Scoreboard Query
export const useScoreboard = (
  roomId: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: battleQueryKeys.scoreboard(roomId || ""),
    queryFn: () => battleApi.getScoreboard(roomId!),
    enabled: !!roomId && options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Room Stats Query (for results page)
export const useRoomStats = (
  roomId: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: battleQueryKeys.roomState(roomId || ""),
    queryFn: () => battleApi.getRoomStats(roomId!),
    enabled: !!roomId && options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Create Room Mutation
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateRoomPayload & { skipSessionCreation?: boolean }
    ) => {
      try {
        const { skipSessionCreation, ...roomPayload } = payload;

        // Create session first if not skipping
        if (!skipSessionCreation) {
          const sessionCreated = await ensureSession(
            roomPayload.hostDisplayName
          );
          if (!sessionCreated) {
            throw new Error("Failed to create session");
          }
          // Small delay to ensure cookie is set
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return await battleApi.createRoom(roomPayload);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate rooms queries
      queryClient.invalidateQueries({ queryKey: battleQueryKeys.rooms() });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Create room failed:", error);
    },
  });
};

// Join Room Mutation
export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      payload,
      skipSessionCreation = false,
    }: {
      roomId: string;
      payload: JoinRoomPayload;
      skipSessionCreation?: boolean;
    }) => {
      try {
        // Create session first if not skipping
        if (!skipSessionCreation) {
          const sessionCreated = await ensureSession(payload.displayName);
          if (!sessionCreated) {
            throw new Error("Failed to create session");
          }
          // Small delay to ensure cookie is set
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return await battleApi.joinRoom(roomId, payload);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate room state for the joined room
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(variables.roomId),
      });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Join room failed:", error);
    },
  });
};

// Start Battle Mutation
export const useStartBattle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      payload,
      headers,
    }: {
      roomId: string;
      payload: StartBattlePayload;
      headers?: Record<string, string>;
    }) => {
      try {
        return await battleApi.startBattle(roomId, payload, headers);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate room state
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(variables.roomId),
      });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Start battle failed:", error);
    },
  });
};

// Submit Answer Mutation
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      roundNo,
      payload,
    }: {
      roomId: string;
      roundNo: number;
      payload: SubmitAnswerPayload;
    }) => {
      try {
        return await battleApi.submitAnswer(roomId, roundNo, payload);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate answer status and room state
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.answerStatus(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(variables.roomId),
      });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Submit answer failed:", error);
    },
  });
};

// Close Round Mutation
export const useCloseRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      roundNo,
    }: {
      roomId: string;
      roundNo: number;
    }) => {
      try {
        return await battleApi.closeRound(roomId, roundNo);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate room state and answer status
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.answerStatus(variables.roomId),
      });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Close round failed:", error);
    },
  });
};

// Reveal Next Round Mutation
export const useRevealNextRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      roundNo,
    }: {
      roomId: string;
      roundNo: number;
    }) => {
      try {
        return await battleApi.revealNextRound(roomId, roundNo);
      } catch (error) {
        // Handle API errors with standardized client error handling
        handleApiError(
          error,
          (message: string, type?: "error" | "warning" | "info") => {
            // You can integrate with your notification system here
            console.log(`[${type?.toUpperCase() || "ERROR"}] ${message}`);
          }
        );

        // Re-throw the original error for React Query to handle
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate room state
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(variables.roomId),
      });
    },
    onError: (error) => {
      // Additional error handling if needed
      console.error("Reveal next round failed:", error);
    },
  });
};

// Custom hook for refreshing battle data
export const useBattleRefresh = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const refreshBattleData = async () => {
    if (!roomId) return;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.roomState(roomId),
      }),
      queryClient.invalidateQueries({
        queryKey: battleQueryKeys.answerStatus(roomId),
      }),
    ]);
  };

  return { refreshBattleData };
};
