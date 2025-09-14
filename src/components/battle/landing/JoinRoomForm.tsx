"use client";

import { motion } from "framer-motion";
import { FaGamepad } from "react-icons/fa";

interface JoinRoomFormProps {
  joinPlayerName: string;
  joinRoomId: string;
  loading: boolean;
  onSetJoinPlayerName: (name: string) => void;
  onSetJoinRoomId: (id: string) => void;
  onHandleJoinRoom: (
    nameOverride?: string,
    skipSessionCreation?: boolean
  ) => void;
  onSetGameMode: (mode: "create" | "join" | null) => void;
}

export function JoinRoomForm({
  joinPlayerName,
  joinRoomId,
  loading,
  onSetJoinPlayerName,
  onSetJoinRoomId,
  onHandleJoinRoom,
  onSetGameMode,
}: JoinRoomFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onSetGameMode(null)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-white">⚔️ Join Battle</h2>
      </div>

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <FaGamepad className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-200 text-lg">
            {joinRoomId
              ? "Ready to join this battle!"
              : "Enter the Room Code to join an existing battle"}
          </p>
          {joinRoomId && (
            <p className="text-cyan-300 text-sm mt-2">
              Room Code:{" "}
              <code className="bg-white/10 px-2 py-1 rounded">
                {joinRoomId}
              </code>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Your Name *
            </label>
            <input
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center text-lg"
              placeholder="Enter your battle name"
              value={joinPlayerName}
              onChange={(e) => onSetJoinPlayerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">
              Room Code *
            </label>
            <input
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center text-xl font-mono"
              placeholder="ABC123"
              value={joinRoomId}
              onChange={(e) => onSetJoinRoomId(e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            onClick={() => onHandleJoinRoom()}
            disabled={loading || !joinRoomId.trim() || !joinPlayerName.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaGamepad className="w-5 h-5" />
            )}
            {loading ? "Joining..." : "Join Battle"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
