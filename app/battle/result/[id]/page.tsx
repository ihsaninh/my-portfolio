"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaCrown,
  FaHome,
  FaQuestionCircle,
  FaRedo,
  FaShare,
  FaStar,
  FaTrophy,
} from "react-icons/fa";

type FinalScoreEntry = {
  session_id: string;
  display_name: string;
  total_score: number;
  is_host?: boolean;
};

type UserAnswer = {
  id: string;
  roundNo: number;
  question: {
    prompt: string;
    difficulty: number;
    language: string;
    category?: string;
  } | null;
  answer: string;
  score: number;
  feedback: string;
};

type UserAnswersResponse = {
  roomId: string;
  totalAnswers: number;
  answers: UserAnswer[];
};

type RoomStats = {
  room?: {
    id: string;
    topic?: string;
    language: string;
    num_questions: number;
    status: string;
  };
  participants?: FinalScoreEntry[];
  currentUser?: {
    session_id: string;
    display_name: string;
    total_score: number;
  };
};

export default function BattleResultPage() {
  const params = useParams<{ id: string }>();
  const roomId = params?.id;
  const [results, setResults] = useState<RoomStats | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswersResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const fetchResults = async () => {
      try {
        // Fetch room results
        const [resultsResponse, answersResponse] = await Promise.all([
          fetch(`/api/battle/rooms/${roomId}/state`),
          fetch(`/api/battle/rooms/${roomId}/my-answers`, {
            credentials: "include",
          }),
        ]);

        const resultsData = await resultsResponse.json();
        setResults(resultsData);

        if (answersResponse.ok) {
          const answersData = await answersResponse.json();
          setUserAnswers(answersData);
        }

        // Show confetti animation
        setTimeout(() => setShowConfetti(true), 500);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [roomId]);

  const sortedParticipants =
    results?.participants?.sort(
      (a, b) => (b.total_score || 0) - (a.total_score || 0)
    ) || [];

  const winner = sortedParticipants[0];
  const currentUserRank =
    sortedParticipants.findIndex(
      (p) => p.session_id === results?.currentUser?.session_id
    ) + 1;

  const shareResults = () => {
    const text = `I just completed a quiz battle! 🏆 Final score: ${
      results?.currentUser?.total_score || 0
    } points. Check out the results!`;
    const resultUrl = `${window.location.origin}/battle/result/${roomId}`;

    if (navigator.share) {
      navigator.share({
        title: "Quiz Battle Results",
        text,
        url: resultUrl,
      });
    } else {
      navigator.clipboard.writeText(text + " " + resultUrl);
      alert("Results copied to clipboard!");
    }
  };

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
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6"
            >
              <FaTrophy className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2">
              🏆 Battle Complete!
            </h1>
            <p className="text-gray-300 text-lg">
              {results?.room?.topic || "Quiz"} • {results?.room?.num_questions}{" "}
              Questions
            </p>

            {/* User's Performance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 inline-block bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Result
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {results?.currentUser?.total_score || 0}
                  </div>
                  <div className="text-sm text-gray-300">Total Points</div>
                </div>
                <div className="w-px h-12 bg-gray-600" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    #{currentUserRank}
                  </div>
                  <div className="text-sm text-gray-300">Rank</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Winner Spotlight */}
          {winner && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8 text-center"
            >
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <FaCrown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎉 Champion: {winner.display_name}
                </h3>
                <p className="text-yellow-300 text-lg font-semibold">
                  {winner.total_score} points
                </p>
              </div>
            </motion.div>
          )}

          {/* Final Leaderboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaTrophy className="w-6 h-6 text-yellow-400" />
              Final Leaderboard
            </h3>

            <div className="space-y-4">
              {sortedParticipants.map((participant, index) => (
                <motion.div
                  key={participant.session_id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    participant.session_id === results?.currentUser?.session_id
                      ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 ring-2 ring-cyan-400/30"
                      : index === 0
                      ? "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-600/20 to-slate-600/20 border border-gray-400/30"
                      : index === 2
                      ? "bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-white shadow-lg"
                          : index === 1
                          ? "bg-gray-400 text-white shadow-lg"
                          : index === 2
                          ? "bg-amber-600 text-white shadow-lg"
                          : "bg-white/20 text-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Medal for top 3 */}
                    {index < 3 && (
                      <FaTrophy
                        className={`w-5 h-5 ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                            ? "text-gray-400"
                            : "text-amber-600"
                        }`}
                      />
                    )}

                    {/* Name & Host badge */}
                    <div>
                      <h4 className="text-white font-semibold">
                        {participant.display_name}
                        {participant.session_id ===
                          results?.currentUser?.session_id && (
                          <span className="ml-2 text-cyan-400 text-sm">
                            (You)
                          </span>
                        )}
                      </h4>
                      {participant.is_host && (
                        <span className="text-xs text-yellow-300 flex items-center gap-1 mt-1">
                          <FaCrown className="w-3 h-3" />
                          Host
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">
                      {participant.total_score || 0}
                    </div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* User Answers Section */}
          {userAnswers && userAnswers.answers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
            >
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="w-full flex items-center justify-between text-left mb-4 hover:bg-white/5 rounded-xl p-2 transition-colors"
              >
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaQuestionCircle className="w-6 h-6 text-blue-400" />
                  Your Quiz Performance
                  <span className="text-lg text-gray-400 font-normal">
                    ({userAnswers.totalAnswers} answers)
                  </span>
                </h3>
                {showAnswers ? (
                  <FaChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <FaChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showAnswers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {userAnswers.answers.map((answer, index) => (
                    <motion.div
                      key={answer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-sm font-semibold">
                              Round {answer.roundNo}
                            </span>
                            {answer.question && (
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs">
                                Difficulty: {answer.question.difficulty}/5
                              </span>
                            )}
                          </div>
                          {answer.question && (
                            <p className="text-white font-medium mb-2">
                              {answer.question.prompt}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300 font-bold">
                            {answer.score} pts
                          </span>
                        </div>
                      </div>

                      {/* User Answer */}
                      <div className="mb-3">
                        <h4 className="text-gray-300 text-sm font-medium mb-1">
                          Your Answer:
                        </h4>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                          <p className="text-cyan-100">{answer.answer}</p>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {answer.feedback && (
                        <div>
                          <h4 className="text-gray-300 text-sm font-medium mb-1">
                            AI Feedback:
                          </h4>
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <p className="text-emerald-100 text-sm leading-relaxed">
                              {answer.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Summary Stats */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-300">
                        {userAnswers.totalAnswers}
                      </div>
                      <div className="text-sm text-gray-300">
                        Questions Answered
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-300">
                        {userAnswers.answers.reduce(
                          (sum, a) => sum + a.score,
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-300">Total Points</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-300">
                        {userAnswers.answers.length > 0
                          ? Math.round(
                              userAnswers.answers.reduce(
                                (sum, a) => sum + a.score,
                                0
                              ) / userAnswers.answers.length
                            )
                          : 0}
                      </div>
                      <div className="text-sm text-gray-300">
                        Avg Score/Question
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={shareResults}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <FaShare className="w-5 h-5" />
              Share Results
            </button>

            <Link
              href="/battle"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <FaRedo className="w-5 h-5" />
              Play Again
            </Link>

            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <FaHome className="w-5 h-5" />
              Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
