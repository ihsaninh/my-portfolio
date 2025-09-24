import { motion } from "framer-motion";
import { FaArrowRight, FaCrown } from "react-icons/fa";

import type { ScoreboardPhaseProps } from "@/src/types/battle";

export function ScoreboardPhase({
  scoreboard,
  isHost,
  loading,
  onAdvance,
  currentSessionId,
  totalRounds,
}: ScoreboardPhaseProps) {
  const isFinalRound = !scoreboard.hasMoreRounds;
  const title = isFinalRound
    ? "Final Standings"
    : `Round ${scoreboard.roundNo} Scoreboard`;
  const subtitle = isFinalRound
    ? "Great job! These are the final results."
    : "Here's how everyone did this round.";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-1 text-sm font-semibold text-yellow-200">
          <FaCrown className="h-4 w-4" />
          {isFinalRound ? "Finale" : `Round ${scoreboard.roundNo}`}
        </div>
        <h3 className="text-2xl font-bold text-white md:text-3xl">{title}</h3>
        <p className="mt-2 text-base text-white/70 md:text-lg">{subtitle}</p>
      </motion.div>

      <div className="w-full max-w-3xl space-y-3">
        {scoreboard.entries.map((entry, index) => {
          const isSelf = entry.sessionId === currentSessionId;
          const rank = index + 1;
          const tierColor =
            rank === 1
              ? "from-yellow-500/20 to-amber-500/20 border-yellow-400/30"
              : rank === 2
              ? "from-slate-500/30 to-indigo-500/20 border-slate-300/30"
              : rank === 3
              ? "from-amber-500/15 to-orange-500/15 border-amber-400/30"
              : "from-slate-800/40 to-slate-700/30 border-white/10";

          return (
            <motion.div
              key={entry.sessionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tierColor} px-5 py-4 shadow-lg transition-transform md:px-6 md:py-5 ${
                isSelf ? "ring-2 ring-cyan-400/60" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-white/80 md:text-3xl">
                    #{rank}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-white md:text-xl">
                      {entry.displayName}
                    </p>
                    <p className="text-sm text-white/60">
                      {isSelf ? "You" : "Participant"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Round Score
                    </p>
                    <p className="text-lg font-semibold text-emerald-300 md:text-xl">
                      +{entry.roundScore}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Total Points
                    </p>
                    <p className="text-2xl font-bold text-white md:text-3xl">
                      {entry.totalScore}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 flex w-full max-w-md flex-col items-center gap-4"
      >
        {isHost ? (
          <button
            onClick={onAdvance}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaArrowRight className="h-5 w-5" />
            {loading
              ? "Processing..."
              : scoreboard.hasMoreRounds
              ? "Start Next Round"
              : "Finish Battle"}
          </button>
        ) : (
          <p className="text-center text-sm text-white/60">
            Waiting for the host to
            {" "}
            {scoreboard.hasMoreRounds ? "start the next round" : "finish the battle"}
            ...
          </p>
        )}

        <p className="text-xs text-white/40">
          Round {scoreboard.roundNo} / {totalRounds}
        </p>
      </motion.div>
    </div>
  );
}
