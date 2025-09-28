"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import {
  ActionButtons,
  Leaderboard,
  ResultHeader,
  UserAnswers,
  WinnerSpotlight,
} from "@/src/features/battle/components";
import { useBattleResult } from "@/src/features/battle/hooks/useBattleResult";

export default function BattleResultPage() {
  const {
    // State values
    results,
    userAnswers,
    loading,
    answersLoading,
    showConfetti,
    showAnswers,
    sortedParticipants,
    winner,
    currentUserRank,

    // State setters
    setShowAnswers,

    // Functions
    shareResults,
  } = useBattleResult();

  // Confetti effect
  useEffect(() => {
    if (!loading && !showConfetti) {
      const timer = setTimeout(() => {
        // setShowConfetti(true); // This is handled in the hook now
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, showConfetti]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Confetti Background Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 ${
                i % 4 === 0
                  ? "bg-yellow-400"
                  : i % 4 === 1
                  ? "bg-purple-400"
                  : i % 4 === 2
                  ? "bg-cyan-400"
                  : "bg-pink-400"
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
              }}
              animate={{
                y: ["0vh", "110vh"],
                rotate: [0, 360, 720],
                x: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <ResultHeader
            topic={results?.room?.topic}
            numQuestions={results?.room?.num_questions}
            userScore={results?.currentUser?.total_score}
            userRank={currentUserRank}
          />

          {/* Winner Spotlight */}
          <WinnerSpotlight
            winnerName={winner?.display_name}
            winnerScore={winner?.total_score}
          />

          {/* Final Leaderboard */}
          <Leaderboard
            participants={sortedParticipants}
            currentUserId={results?.currentUser?.session_id}
          />

          {/* User Answers Section */}
          {answersLoading && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 text-center text-white/70">
              Loading your round-by-round answers...
            </div>
          )}
          {userAnswers && userAnswers.answers.length > 0 && (
            <UserAnswers
              userAnswers={userAnswers.answers}
              totalAnswers={userAnswers.totalAnswers}
              showAnswers={showAnswers}
              onToggleShowAnswers={() => setShowAnswers(!showAnswers)}
            />
          )}

          {/* Action Buttons */}
          <ActionButtons onShare={shareResults} />
        </div>
      </div>
    </div>
  );
}
