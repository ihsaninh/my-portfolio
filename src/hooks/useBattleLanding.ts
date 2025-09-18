import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCreateRoom, useJoinRoom } from "@/src/hooks/useBattleQueries";

type GameMode = "create" | "join" | null;

export function useBattleLanding() {
  const router = useRouter();

  // TanStack Query mutations
  const createRoomMutation = useCreateRoom();
  const joinRoomMutation = useJoinRoom();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [createPayload, setCreatePayload] = useState({
    topic: "",
    hostDisplayName: "",
    language: "en" as "en" | "id",
    numQuestions: 5,
    roundTimeSec: 60,
    capacity: 4,
    questionType: "open-ended" as "open-ended" | "multiple-choice",
  });
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [log, setLog] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute loading state from mutations
  const loading = createRoomMutation.isPending || joinRoomMutation.isPending;

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPayload.hostDisplayName.trim()) {
      setLog("Please enter your name to continue");
      return;
    }

    setLog("");
    try {
      const result = await createRoomMutation.mutateAsync({
        ...createPayload,
        skipSessionCreation: false,
      });

      // Store room ID and code, switch to success view
      setCreatedRoomId(result.roomId);
      setCreatedRoomCode(result.roomCode);
      setJoinRoomId(result.roomId);

      // Hide the form and show success message
      setGameMode(null);
    } catch (err: unknown) {
      setLog(
        `Failed to create room: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleJoinRoom = async (
    nameOverride?: string,
    skipSessionCreation = false
  ) => {
    const roomId = joinRoomId;
    // Ensure playerName is always a string and handle edge cases
    let playerName: string;
    if (typeof nameOverride === "string") {
      playerName = nameOverride;
    } else if (typeof joinPlayerName === "string") {
      playerName = joinPlayerName;
    } else {
      playerName = "";
    }

    if (!roomId || typeof roomId !== "string" || !roomId.trim()) {
      setLog("Please enter a valid Room Code");
      return;
    }
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      setLog("Please enter your player name");
      return;
    }

    setLog("");
    try {
      const result = await joinRoomMutation.mutateAsync({
        roomId,
        payload: { displayName: playerName.trim() },
        skipSessionCreation,
      });

      // Small delay to ensure the join is processed on the server
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirect to room using the actual room ID from response
      const actualRoomId = result.roomId || roomId;
      router.push(`/battle/rooms/${actualRoomId}`);
    } catch (err: unknown) {
      console.error("Join error:", err);
      setLog(
        `Join error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const copyRoomCode = async () => {
    if (createdRoomCode) {
      try {
        const fullUrl = `${window.location.origin}/battle/join?roomCode=${createdRoomCode}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return {
    // State values
    gameMode,
    createPayload,
    joinPlayerName,
    joinRoomId,
    loading,
    log,
    createdRoomId,
    createdRoomCode,
    copied,

    // State setters
    setGameMode,
    setCreatePayload,
    setJoinPlayerName,
    setJoinRoomId,
    setLog,
    setCreatedRoomId,
    setCreatedRoomCode,
    setCopied,

    // Functions
    createRoom,
    handleJoinRoom,
    copyRoomCode,
  };
}
