"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import {
  BattleHeader,
  CreateRoomForm,
  ErrorDisplay,
  GameModeSelection,
  JoinRoomForm,
  RoomCreatedSuccess,
} from "@/src/components/battle";
import { useBattleLanding } from "@/src/hooks/useBattleLanding";

function BattleLandingContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const {
    // State values
    gameMode,
    createPayload,
    joinPlayerName,
    joinRoomId,
    loading,
    log,
    createdRoomCode,
    copied,

    // State setters
    setGameMode,
    setCreatePayload,
    setJoinPlayerName,
    setJoinRoomId,
    setLog,
    setCreatedRoomCode,
    // setCopied is used in the hook but not directly in the component

    // Functions
    createRoom,
    handleJoinRoom,
    copyRoomCode,
  } = useBattleLanding();

  // Auto-populate join form if roomId or roomCode is provided in URL
  useEffect(() => {
    const urlRoomCode =
      searchParams?.get("roomCode") || searchParams?.get("roomId");
    if (urlRoomCode && joinRoomId !== urlRoomCode) {
      setJoinRoomId(urlRoomCode);
      setGameMode("join"); // Automatically switch to join mode
    }
  }, [searchParams, joinRoomId, setJoinRoomId, setGameMode]);

  // Avoid hydration mismatches by generating random positions only on client
  useEffect(() => setMounted(true), []);
  const orbPositions = useMemo(() => {
    if (!mounted) return [] as Array<{ left: string; top: string }>;
    return Array.from({ length: 8 }, () => ({
      left: `${Math.round(Math.random() * 10000) / 100}%`,
      top: `${Math.round(Math.random() * 10000) / 100}%`,
    }));
  }, [mounted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating orbs */}
        {orbPositions.map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-20 blur-xl ${
              i % 3 === 0
                ? "bg-gradient-to-br from-purple-400 to-pink-400"
                : i % 3 === 1
                ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                : "bg-gradient-to-br from-emerald-400 to-teal-400"
            }`}
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <BattleHeader />

          {/* Game Mode Selection */}
          {!gameMode && !createdRoomCode && (
            <GameModeSelection onSetGameMode={setGameMode} />
          )}

          {/* Create Room Form */}
          <AnimatePresence>
            {gameMode === "create" && (
              <CreateRoomForm
                createPayload={createPayload}
                loading={loading}
                onCreateRoom={createRoom}
                onSetCreatePayload={setCreatePayload}
                onSetGameMode={setGameMode}
              />
            )}
          </AnimatePresence>

          {/* Join Room Form */}
          <AnimatePresence>
            {gameMode === "join" && (
              <JoinRoomForm
                joinPlayerName={joinPlayerName}
                joinRoomId={joinRoomId}
                loading={loading}
                onSetJoinPlayerName={setJoinPlayerName}
                onSetJoinRoomId={setJoinRoomId}
                onHandleJoinRoom={handleJoinRoom}
                onSetGameMode={setGameMode}
              />
            )}
          </AnimatePresence>

          {/* Room Created Success View */}
          <AnimatePresence>
            {createdRoomCode && (
              <RoomCreatedSuccess
                createdRoomCode={createdRoomCode}
                createPayload={createPayload}
                loading={loading}
                copied={copied}
                onSetCreatedRoomCode={setCreatedRoomCode}
                onSetGameMode={setGameMode}
                onSetLog={setLog}
                onCopyRoomCode={copyRoomCode}
                onHandleJoinRoom={handleJoinRoom}
              />
            )}
          </AnimatePresence>

          {/* Error Display */}
          <ErrorDisplay log={log} />
        </div>
      </div>
    </div>
  );
}

export default function BattleLanding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p>Loading battle interface...</p>
          </div>
        </div>
      }
    >
      <BattleLandingContent />
    </Suspense>
  );
}
