"use client";

import { motion } from "framer-motion";
import { FaPlay, FaRocket, FaUsers } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle-store";
import type { WaitingPhaseProps } from "@/src/types/battle";

export function WaitingPhase({
  onStartBattle,
  isHost,
  loading,
}: WaitingPhaseProps) {
  const { state } = useBattleStore();
  const participantCount = state?.participants?.length || 0;
  const roomCapacity = state?.room?.capacity || 2;
  const minParticipants = Math.min(2, roomCapacity);
  const canStart = participantCount >= minParticipants;

  // Debug logging for participant count issues
  console.log("[WAITING_PHASE] Participant count:", {
    count: participantCount,
    capacity: roomCapacity,
    minParticipants,
    canStart,
    participants: state?.participants,
    roomId: state?.room?.id,
  });

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
      >
        <FaRocket className="w-10 h-10 text-white" />
      </motion.div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ready to Battle?
        </h3>

        {/* Participant Count Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <FaUsers className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            {participantCount}/{roomCapacity} players
          </span>
        </div>

        <p className="text-gray-300 mb-6">
          {isHost
            ? canStart
              ? "All players are ready! Let's start the battle!"
              : `Waiting for ${
                  minParticipants - participantCount
                } more player(s) to start the battle...`
            : "Waiting for the host to start the battle..."}
        </p>

        {isHost && (
          <button
            onClick={onStartBattle}
            disabled={loading || !canStart}
            className={`px-8 py-4 font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto ${
              canStart
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaPlay className="w-5 h-5" />
            )}
            {loading
              ? "Starting..."
              : canStart
              ? "Start Battle"
              : "Waiting for Players"}
          </button>
        )}
      </div>
    </div>
  );
}
