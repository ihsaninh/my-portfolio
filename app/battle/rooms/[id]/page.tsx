"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  FloatingParticipantsButton,
  GameArea,
  Participants,
  RoomHeader,
  RoomInfo,
} from "@/src/components/battle";
import { useBattleLogic } from "@/src/hooks/useBattleLogic";
import { useBattleStore } from "@/src/lib/battle-store";

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
    loading,
    connectionState,
    connectionError,

    // Functions
    copyRoomLink,
    refresh,
    startBattle,
    submitAnswer,

    // Derived values
    isHost,
  } = useBattleLogic();

  useEffect(() => setMounted(true), []);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        const store = useBattleStore.getState();
        // Remove the oldest notification (first in array)
        const updatedNotifications = store.notifications.slice(1);
        store.setNotifications(updatedNotifications);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const orbPositions = useMemo(() => {
    if (!mounted) return [] as Array<{ left: string; top: string }>;
    // 6 orbs with client-only random positions to avoid SSR mismatch
    return Array.from({ length: 6 }, () => ({
      left: `${Math.round(Math.random() * 10000) / 100}%`,
      top: `${Math.round(Math.random() * 10000) / 100}%`,
    }));
  }, [mounted]);

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
            <div className="flex items-center gap-2">
              <span className="flex-1">{notification}</span>
              <button
                onClick={() => {
                  // Remove this specific notification
                  const store = useBattleStore.getState();
                  const updatedNotifications = store.notifications.filter(
                    (_: string, i: number) => i !== index
                  );
                  store.setNotifications(updatedNotifications);
                }}
                className="text-purple-200 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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
              />
            </div>
          </div>

          {/* Floating Participants Button - Only on mobile */}
          <FloatingParticipantsButton
            roomId={roomId}
            participantCount={state?.participants?.length || 0}
          />
        </div>
      </div>
    </div>
  );
}
