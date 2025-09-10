import { useRouter } from "next/navigation";
import { useState } from "react";

type GameMode = "create" | "join" | null;

export function useBattleLanding() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function ensureSession(name: string) {
    try {
      const res = await fetch("/api/quiz/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name || "Player" }),
      });
      return res.ok;
    } catch (error) {
      console.error("Session creation error:", error);
      return false;
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!createPayload.hostDisplayName.trim()) {
      setLog("Please enter your name to continue");
      return;
    }

    setLoading(true);
    setLog("");
    try {
      // Always ensure session exists first
      const sessionCreated = await ensureSession(createPayload.hostDisplayName);
      if (!sessionCreated) {
        throw new Error("Failed to create session");
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now create the room
      const res = await fetch("/api/battle/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      // Store room ID and switch to success view
      setCreatedRoomId(data.roomId);
      setJoinRoomId(data.roomId);

      // Hide the form and show success message
      setGameMode(null);
    } catch (err: unknown) {
      setLog(
        `Failed to create room: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(
    nameOverride?: string,
    skipSessionCreation = false
  ) {
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
      setLog("Please enter a valid Room ID");
      return;
    }
    if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
      setLog("Please enter your player name");
      return;
    }

    setLoading(true);
    setLog("");
    try {
      // Create session first (skip if already created during room creation)
      if (!skipSessionCreation) {
        const sessionCreated = await ensureSession(playerName);

        if (!sessionCreated) {
          throw new Error("Failed to create session");
        }

        // Small delay to ensure cookie is set
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Then join the room with the display name
      const res = await fetch(`/api/battle/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: playerName.trim() }),
        credentials: "include", // Ensure cookies are sent
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to join room");

      // Small delay to ensure the join is processed on the server
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirect to room using Next.js router
      router.push(`/battle/rooms/${roomId}`);
    } catch (err: unknown) {
      console.error("Join error:", err);
      setLog(
        `Join error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  }

  const copyRoomId = async () => {
    if (createdRoomId) {
      try {
        const fullUrl = `${window.location.origin}/battle?roomId=${createdRoomId}`;
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
    copied,

    // State setters
    setGameMode,
    setCreatePayload,
    setJoinPlayerName,
    setJoinRoomId,
    setLog,
    setCreatedRoomId,
    setCopied,

    // Functions
    createRoom,
    handleJoinRoom,
    copyRoomId,
  };
}
