"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import {
  BattleHeader,
  BattlePageShell,
  ErrorDisplay,
  JoinRoomForm,
} from "@/src/components/battle";
import { useBattleLanding } from "@/src/hooks/useBattleLanding";

export default function BattleJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    joinPlayerName,
    joinRoomId,
    loading,
    log,
    setGameMode,
    setJoinPlayerName,
    setJoinRoomId,
    setLog,
    handleJoinRoom,
  } = useBattleLanding();

  useEffect(() => {
    setGameMode("join");
    setLog("");
  }, [setGameMode, setLog]);

  useEffect(() => {
    const urlRoomCode =
      searchParams?.get("roomCode") || searchParams?.get("roomId");

    if (urlRoomCode && joinRoomId !== urlRoomCode) {
      setJoinRoomId(urlRoomCode);
    }
  }, [searchParams, joinRoomId, setJoinRoomId]);

  const handleNavigateToLanding = useCallback(
    (mode: "create" | "join" | null) => {
      router.push(mode ? `/battle/${mode}` : "/battle");
    },
    [router]
  );

  return (
    <BattlePageShell>
      <BattleHeader />
      <JoinRoomForm
        joinPlayerName={joinPlayerName}
        joinRoomId={joinRoomId}
        loading={loading}
        onSetJoinPlayerName={setJoinPlayerName}
        onSetJoinRoomId={setJoinRoomId}
        onHandleJoinRoom={handleJoinRoom}
        onSetGameMode={handleNavigateToLanding}
      />
      <ErrorDisplay log={log} />
    </BattlePageShell>
  );
}
