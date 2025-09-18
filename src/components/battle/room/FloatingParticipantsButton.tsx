"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaInfo, FaUsers } from "react-icons/fa";

import { Participants } from "./Participants";
import { RoomInfo } from "./RoomInfo";

interface FloatingParticipantsButtonProps {
  roomId: string;
  participantCount: number;
}

export function FloatingParticipantsButton({
  roomId,
  participantCount,
}: FloatingParticipantsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"participants" | "roomInfo">(
    "participants"
  );

  return (
    <>
      {/* Floating Button - Only visible on mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg border border-blue-500/30"
        aria-label="Show room info and participants"
      >
        <div className="relative">
          <FaUsers className="w-6 h-6" />
          {participantCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {participantCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header with Tabs */}
              <div className="border-b border-white/10">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("participants")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "participants"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <FaUsers className="w-4 h-4" />
                      Players ({participantCount})
                    </button>
                    <button
                      onClick={() => setActiveTab("roomInfo")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "roomInfo"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <FaInfo className="w-4 h-4" />
                      Room Info
                    </button>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
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
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
                {activeTab === "participants" ? (
                  <Participants roomId={roomId} variant="compact" />
                ) : (
                  <RoomInfo roomId={roomId} variant="compact" />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
