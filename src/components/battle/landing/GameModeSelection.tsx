"use client";

import { motion } from "framer-motion";
import {
  FaBolt,
  FaCog,
  FaCrown,
  FaGamepad,
  FaStar,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";

interface GameModeSelectionProps {
  onSetGameMode: (mode: "create" | "join" | null) => void;
}

export function GameModeSelection({ onSetGameMode }: GameModeSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
    >
      {/* Create Room Card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSetGameMode("create")}
        className="group cursor-pointer relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-pink-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              <FaCrown className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Host Battle
              </h3>
              <p className="text-purple-200">Create and lead your own arena</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <FaCog className="w-4 h-4 text-purple-400" /> Customize game
              settings
            </li>
            <li className="flex items-center gap-2">
              <FaBolt className="w-4 h-4 text-purple-400" /> AI-generated
              questions
            </li>
            <li className="flex items-center gap-2">
              <FaUsers className="w-4 h-4 text-purple-400" /> Invite up to 12
              players
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-2 text-purple-300 font-semibold">
            <span>Start Creating</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Join Room Card */}
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSetGameMode("join")}
        className="group cursor-pointer relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/50 via-blue-800/30 to-teal-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
              <FaGamepad className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Join Battle
              </h3>
              <p className="text-cyan-200">Enter an existing arena</p>
            </div>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <FaBolt className="w-4 h-4 text-cyan-400" /> Jump into action
              instantly
            </li>
            <li className="flex items-center gap-2">
              <FaTrophy className="w-4 h-4 text-cyan-400" /> Compete for the top
              spot
            </li>
            <li className="flex items-center gap-2">
              <FaStar className="w-4 h-4 text-cyan-400" /> Earn points and glory
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-2 text-cyan-300 font-semibold">
            <span>Join Now</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
