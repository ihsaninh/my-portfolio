import { motion } from "framer-motion";
import { FaClock, FaUsers } from "react-icons/fa";

import { useBattleStore } from "@/src/lib/battle/battle-store";
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
      className="flex flex-col rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl min-h-[520px] md:min-h-[600px]"
    >
      {/* Game Header */}
      <div className="border-b border-white/10 px-5 py-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-white md:text-2xl">
            {gamePhase === "waiting" && "⏳ Waiting for Battle to Start"}
            {gamePhase === "playing" && "🎮 Battle in Progress"}
            {gamePhase === "answering" && "📝 Answer the Question"}
            {gamePhase === "finished" && "🏆 Battle Finished"}
          </h2>
          {timeLeft !== null && gamePhase === "answering" && (
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold md:text-lg md:px-4 md:py-2 ${
                  timeLeft <= 10
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : timeLeft <= 30
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
              >
                <FaClock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>

              {/* Answered Count Indicator */}
              <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-sm font-semibold text-blue-200 md:text-lg md:px-4 md:py-2">
                <FaUsers className="h-4 w-4" />
                {answeredCount}/{state?.participants?.length || 0} answered
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 px-5 py-5 md:p-6">
        {gamePhase === "waiting" && (
          <WaitingPhase
            onStartBattle={onStartBattle}
            isHost={isHost}
            loading={loading}
          />
        )}
        {gamePhase === "answering" &&
          state?.activeRound?.status === "active" &&
          (state?.activeRound?.question ? (
            <AnsweringPhase
              onSubmitAnswer={onSubmitAnswer}
              iHaveAnswered={iHaveAnswered}
              loading={loading}
            />
          ) : (
            <div className="text-center p-6">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading question...</p>
            </div>
          ))}
        {gamePhase === "finished" && <FinishedPhase />}
        {gamePhase === "playing" && !state?.activeRound && <PlayingPhase />}
      </div>
    </motion.div>
  );
}
