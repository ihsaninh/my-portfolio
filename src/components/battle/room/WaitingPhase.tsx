"use client";

import { motion } from "framer-motion";
import { FaPlay, FaRocket } from "react-icons/fa";

import type { WaitingPhaseProps } from "@/src/types/battle";

export function WaitingPhase({
  onStartBattle,
  isHost,
  loading,
}: WaitingPhaseProps) {
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
        <p className="text-gray-300 mb-6">
          {isHost
            ? "You can start the battle when all players are ready!"
            : "Waiting for the host to start the battle..."}
        </p>
        {isHost && (
          <button
            onClick={onStartBattle}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaPlay className="w-5 h-5" />
            )}
            {loading ? "Starting..." : "Start Battle"}
          </button>
        )}
      </div>
    </div>
  );
}
