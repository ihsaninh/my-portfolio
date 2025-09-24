"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaBolt } from "react-icons/fa";

import {
  BattleNotifications,
  FloatingParticipantsButton,
  GameArea,
  Participants,
  RoomHeader,
  RoomInfo,
} from "@/src/components/battle";
import { useBattleLogic } from "@/src/hooks/useBattleLogic";
import { useBattleStore } from "@/src/lib/battle/battle-store";

export default function BattleRoom() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    // State values
    roomId,
    timeLeft,
    state,
    answeredCount,
    totalParticipants,
    iHaveAnswered,
    loading,
    connectionState,
    connectionError,

    // Functions
    copyRoomLink,
    startBattle,
    submitAnswer,
    advanceFromScoreboard,

    // Derived values
    isHost,
    scoreboard,
    advanceFromScoreboardLoading,
  } = useBattleLogic();

  // Access to selected answer for quick submit validation
  const { selectedChoiceId, answer } = useBattleStore();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const updateViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, [mounted]);

  const orbPositions = useMemo(() => {
    if (!mounted) return [] as Array<{ left: string; top: string }>;
    // 6 orbs with client-only random positions to avoid SSR mismatch
    const orbCount = isMobile ? 3 : 6;
    return Array.from({ length: orbCount }, () => ({
      left: `${Math.round(Math.random() * 10000) / 100}%`,
      top: `${Math.round(Math.random() * 10000) / 100}%`,
    }));
  }, [mounted, isMobile]);

  // Show connection error message
  if (connectionState === "disconnected" && connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Connection Error
          </h2>
          <p className="text-white/70 mb-4">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </motion.div>
      </div>
    );
  }

  if (!state?.room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          {/* Enhanced spinner */}
          <div className="relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <div className="w-full h-full border-4 border-purple-500/20 border-t-purple-500 rounded-full" />
            </motion.div>

            {/* Inner spinning element */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-pink-500/20 border-b-pink-500 rounded-full"
            />

            {/* Center logo */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            </motion.div>
          </div>

          {/* Loading text with animation */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white/90 text-lg font-medium mb-2">Loading battle room</p>
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="text-purple-400 text-xl"
                >
                  .
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-4 max-w-xs"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-900 relative overflow-hidden">
      {/* Connection Status Indicator */}
      {connectionState === "disconnected" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-xl border border-red-400/30 rounded-xl px-4 py-2 text-white text-sm shadow-lg">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Reconnecting...
          </div>
        </div>
      )}

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
      <BattleNotifications
        mobileBreakpoint={1024}
        desktopPositionClass="right-4"
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="md:rounded-3xl md:border md:border-white/10 md:bg-white/5 md:p-8 md:backdrop-blur-2xl md:shadow-2xl md:shadow-purple-500/10">
            {/* Room Header */}
            <RoomHeader
              roomId={roomId}
              onCopyRoomLink={copyRoomLink}
              roomStatus={state?.room?.status || "waiting"}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Room Info & Participants - Hidden on mobile */}
              <div className="hidden lg:block lg:col-span-1 space-y-6">
                {/* Room Info */}
                <RoomInfo roomId={roomId} />

                {/* Participants */}
                <Participants roomId={roomId} />
              </div>

              {/* Right Column - Game Area - Full width on mobile */}
              <div className="col-span-1 lg:col-span-2">
                <GameArea
                  timeLeft={timeLeft}
                  answeredCount={answeredCount}
                  onStartBattle={startBattle}
                  onSubmitAnswer={submitAnswer}
                  isHost={isHost}
                  iHaveAnswered={iHaveAnswered}
                  loading={loading}
                  totalParticipants={totalParticipants}
                  scoreboard={scoreboard}
                  onAdvanceFromScoreboard={advanceFromScoreboard}
                  advanceFromScoreboardLoading={advanceFromScoreboardLoading}
                />
              </div>
            </div>

            {/* Floating Participants Button - Only on mobile */}
            <FloatingParticipantsButton
              roomId={roomId}
              participantCount={state?.participants?.length || 0}
            />

            {/* Quick Action Submit Button - Only during answering phase on mobile */}
            {state?.room?.status === "active" &&
             state.activeRound &&
             !iHaveAnswered &&
             timeLeft !== null &&
             timeLeft > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={submitAnswer}
                disabled={
                  loading ||
                  (state.activeRound?.question?.choices?.length
                    ? !selectedChoiceId
                    : !answer.trim())
                }
                className="fixed bottom-32 right-4 z-30 lg:hidden w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-xl border border-green-500/30 backdrop-blur-sm transition-all"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom) + 8rem)',
                }}
                aria-label="Quick submit answer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <motion.div
                    animate={{
                      scale: timeLeft <= 10 ? [1, 1.2, 1] : 1,
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      scale: { duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 },
                      rotate: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <FaBolt className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
