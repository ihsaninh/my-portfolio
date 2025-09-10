"use client";

import { motion } from "framer-motion";
import { FaGamepad } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle-store";

interface RoomInfoProps {
  roomId: string;
}

export function RoomInfo({}: RoomInfoProps) {
  const { state } = useBattleStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!state?.room) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-purple-500/30 bg-purple-900/20 p-6 backdrop-blur-xl"
    >
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FaGamepad className="w-5 h-5 text-purple-400" />
        Room Settings
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Topic:</span>
          <span className="text-white">
            {state.room.topic || "General Knowledge"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Language:</span>
          <span className="text-white">
            {state.room.language === "id" ? "🇮🇩 Bahasa" : "🇺🇸 English"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Questions:</span>
          <span className="text-white">{state.room.num_questions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Time per Round:</span>
          <span className="text-white">
            {formatTime(state.room.round_time_sec)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
