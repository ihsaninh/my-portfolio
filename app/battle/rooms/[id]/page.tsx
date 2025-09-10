"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  GameArea,
  Participants,
  RoomHeader,
  RoomInfo,
} from "@/src/components/battle";
import { useBattleLogic } from "@/src/hooks/useBattleLogic";

export default function BattleRoom() {
  const [mounted, setMounted] = useState(false);
  const {
    // State values
    roomId,
    timeLeft,
    state,
    notifications,
    answeredCount,
    iHaveAnswered,

    // Functions
    copyRoomLink,
    refresh,
    startBattle,
    submitAnswer,

    // Derived values
    isHost,
  } = useBattleLogic();

  useEffect(() => setMounted(true), []);
  const orbPositions = useMemo(() => {
    if (!mounted) return [] as Array<{ left: string; top: string }>;
    // 6 orbs with client-only random positions to avoid SSR mismatch
    return Array.from({ length: 6 }, () => ({
      left: `${Math.round(Math.random() * 10000) / 100}%`,
      top: `${Math.round(Math.random() * 10000) / 100}%`,
    }));
  }, [mounted]);

  if (!state?.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading battle room...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {orbPositions.map((pos, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-10 blur-xl ${
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
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={`${notification}-${index}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-4 right-4 z-50 bg-purple-600/90 backdrop-blur-xl border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm shadow-lg"
            style={{ top: `${1 + index * 4}rem` }}
          >
            {notification}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Room Header */}
          <RoomHeader
            roomId={roomId}
            onCopyRoomLink={copyRoomLink}
            onRefresh={refresh}
            roomStatus={state?.room?.status || "waiting"}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Room Info & Participants */}
            <div className="lg:col-span-1 space-y-6">
              {/* Room Info */}
              <RoomInfo roomId={roomId} />

              {/* Participants */}
              <Participants roomId={roomId} />
            </div>

            {/* Right Column - Game Area */}
            <div className="lg:col-span-2">
              <GameArea
                timeLeft={timeLeft}
                answeredCount={answeredCount}
                onStartBattle={startBattle}
                onSubmitAnswer={submitAnswer}
                isHost={isHost}
                iHaveAnswered={iHaveAnswered}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
