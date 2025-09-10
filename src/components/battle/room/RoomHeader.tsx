"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCopy } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle-store";

interface RoomHeaderProps {
  roomId: string;
  onCopyRoomLink: () => void;
  onRefresh: () => void;
  roomStatus?: string;
}

export function RoomHeader({
  roomId,
  onCopyRoomLink,
  onRefresh,
  roomStatus = "waiting",
}: RoomHeaderProps) {
  const { copied, connectionState } = useBattleStore();

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "finished":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/battle"
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              ⚔️ Battle Room
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>ID: {roomId}</span>
              <span
                className={`px-2 py-1 rounded-full border text-xs ${getRoomStatusColor(
                  roomStatus
                )}`}
              >
                {roomStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
              connectionState === "connected"
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : connectionState === "reconnecting"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionState === "connected"
                  ? "bg-green-400 animate-pulse"
                  : connectionState === "reconnecting"
                  ? "bg-yellow-400 animate-spin"
                  : "bg-red-400"
              }`}
            />
            {connectionState}
          </div>

          <button
            onClick={onCopyRoomLink}
            className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-xl transition-all flex items-center gap-2"
          >
            <FaCopy className="w-4 h-4" />
            {copied ? "Copied!" : "Share Room"}
          </button>
          <button
            onClick={onRefresh}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            🔄
          </button>
        </div>
      </div>
    </motion.div>
  );
}
