import { motion } from "framer-motion";
import { FaClock, FaUsers } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle-store";
import type { GameAreaProps } from "@/src/types/battle";

import { AnsweringPhase } from "./AnsweringPhase";
import { FinishedPhase } from "./FinishedPhase";
import { PlayingPhase } from "./PlayingPhase";
import { WaitingPhase } from "./WaitingPhase";

export function GameArea({
  timeLeft,
  answeredCount,
  onStartBattle,
  onSubmitAnswer,
  isHost,
  iHaveAnswered,
  loading,
}: GameAreaProps) {
  const { state, gamePhase } = useBattleStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl min-h-[600px] flex flex-col"
    >
      {/* Game Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {gamePhase === "waiting" && "⏳ Waiting for Battle to Start"}
            {gamePhase === "playing" && "🎮 Battle in Progress"}
            {gamePhase === "answering" && "📝 Answer the Question"}
            {gamePhase === "finished" && "🏆 Battle Finished"}
          </h2>
          {timeLeft !== null && gamePhase === "answering" && (
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-xl font-bold text-lg ${
                  timeLeft <= 10
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : timeLeft <= 30
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
              >
                <FaClock className="w-4 h-4 inline mr-2" />
                {formatTime(timeLeft)}
              </div>

              {/* Answered Count Indicator */}
              <div className="px-4 py-2 rounded-xl font-bold text-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <FaUsers className="w-4 h-4 inline mr-2" />
                {answeredCount}/{state?.participants?.length || 0} answered
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 p-6">
        {gamePhase === "waiting" && (
          <WaitingPhase
            onStartBattle={onStartBattle}
            isHost={isHost}
            loading={loading}
          />
        )}
        {gamePhase === "answering" &&
          state?.activeRound?.status === "active" &&
          state?.activeRound?.question && (
            <AnsweringPhase
              onSubmitAnswer={onSubmitAnswer}
              iHaveAnswered={iHaveAnswered}
              loading={loading}
            />
          )}
        {gamePhase === "finished" && <FinishedPhase />}
        {gamePhase === "playing" && !state?.activeRound && <PlayingPhase />}
      </div>
    </motion.div>
  );
}
