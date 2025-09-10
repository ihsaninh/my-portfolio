"use client";

import { motion } from "framer-motion";
import { FaCopy, FaCrown, FaTrophy } from "react-icons/fa";

interface RoomCreatedSuccessProps {
  createdRoomId: string | null;
  createPayload: {
    hostDisplayName: string;
  };
  loading: boolean;
  copied: boolean;
  onSetCreatedRoomId: (id: string | null) => void;
  onSetGameMode: (mode: "create" | "join" | null) => void;
  onSetLog: (log: string) => void;
  onCopyRoomId: () => void;
  onHandleJoinRoom: (
    nameOverride?: string,
    skipSessionCreation?: boolean
  ) => void;
}

export function RoomCreatedSuccess({
  createdRoomId,
  createPayload,
  loading,
  copied,
  onSetCreatedRoomId,
  onSetGameMode,
  onSetLog,
  onCopyRoomId,
  onHandleJoinRoom,
}: RoomCreatedSuccessProps) {
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
          onClick={() => {
            onSetCreatedRoomId(null);
            onSetGameMode(null);
            onSetLog("");
          }}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-white">🏆 Room Created</h2>
      </div>

      <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-8 backdrop-blur-xl text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaTrophy className="w-10 h-10 text-green-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">
          Room created successfully!
        </h2>

        <p className="text-green-200 mb-6">
          Room ID: <span className="font-bold">{createdRoomId}</span>
        </p>

        <p className="text-green-300 mb-6">
          Share this Room ID with your friends:
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <code className="bg-white/10 px-4 py-3 rounded-xl text-white text-lg font-mono">
            {createdRoomId}
          </code>
          <button
            onClick={onCopyRoomId}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <FaCopy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              // Join directly with host name - ensure it's a valid string
              const hostName = createPayload.hostDisplayName?.trim();
              if (hostName) {
                // Skip session creation since it was already done during room creation
                onHandleJoinRoom(hostName, true);
              } else {
                onSetLog("Host name is required to join the room");
              }
            }}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaCrown className="w-5 h-5" />
            )}
            {loading ? "Joining..." : "Join as Host"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
