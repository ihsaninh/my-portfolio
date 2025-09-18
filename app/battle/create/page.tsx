"use client";

import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import {
  BattleHeader,
  BattlePageShell,
  CreateRoomForm,
  ErrorDisplay,
  RoomCreatedSuccess,
} from "@/src/components/battle";
import { useBattleLanding } from "@/src/hooks/useBattleLanding";

export default function BattleCreatePage() {
  const router = useRouter();
  const {
    createPayload,
    loading,
    log,
    createdRoomCode,
    copied,
    setCreatePayload,
    setCreatedRoomCode,
    setGameMode,
    setLog,
    copyRoomCode,
    createRoom,
    handleJoinRoom,
  } = useBattleLanding();

  useEffect(() => {
    setGameMode("create");
    setLog("");
  }, [setGameMode, setLog]);

  const handleNavigateToLanding = useCallback(
    (mode: "create" | "join" | null) => {
      router.push(mode ? `/battle/${mode}` : "/battle");
    },
    [router]
  );

  return (
    <BattlePageShell>
      <BattleHeader />
      <AnimatePresence mode="wait">
        {createdRoomCode ? (
          <RoomCreatedSuccess
            key="success"
            createdRoomCode={createdRoomCode}
            createPayload={createPayload}
            loading={loading}
            copied={copied}
            onSetCreatedRoomCode={setCreatedRoomCode}
            onSetGameMode={handleNavigateToLanding}
            onSetLog={setLog}
            onCopyRoomCode={copyRoomCode}
            onHandleJoinRoom={handleJoinRoom}
          />
        ) : (
          <CreateRoomForm
            key="form"
            createPayload={createPayload}
            loading={loading}
            onCreateRoom={createRoom}
            onSetCreatePayload={setCreatePayload}
            onSetGameMode={handleNavigateToLanding}
          />
        )}
      </AnimatePresence>
      <ErrorDisplay log={log} />
    </BattlePageShell>
  );
}
