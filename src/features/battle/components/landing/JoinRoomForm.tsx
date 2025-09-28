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
      className="max-w-2xl mx-auto w-full"
    >
      <div className="mb-5 md:mb-6 flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => onSetGameMode(null)}
          className="p-2.5 md:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl">⚔️</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Join Battle</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-900/20 p-5 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15">
              <FaGamepad className="h-6 w-6 text-cyan-300" />
            </span>
            <div className="text-left">
              <p className="text-base md:text-lg font-semibold text-white">
                {joinRoomId ? "Ready to join" : "Enter a room code"}
              </p>
              <p className="text-sm text-cyan-200/80 md:text-cyan-200">
                Join in seconds and start scoring points.
              </p>
            </div>
          </div>
          {joinRoomId && (
            <div className="md:text-right">
              <p className="text-xs uppercase tracking-wide text-cyan-300/80 mb-1">
                Room Code
              </p>
              <code className="inline-flex items-center rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
                {joinRoomId}
              </code>
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-5">
          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-medium text-cyan-200">
              Your Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center"
              placeholder="Your display name"
              value={joinPlayerName}
              onChange={(e) => onSetJoinPlayerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs md:text-sm font-medium text-cyan-200">
              Room Code
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center text-lg tracking-[0.3em] uppercase"
              placeholder="ABC123"
              value={joinRoomId}
              onChange={(e) =>
                onSetJoinRoomId(e.target.value.toUpperCase().slice(0, 6))
              }
              required
              maxLength={6}
            />
          </div>

          <button
            type="button"
            onClick={() => onHandleJoinRoom()}
            disabled={loading || !joinRoomId.trim() || !joinPlayerName.trim()}
            className="w-full px-6 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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
