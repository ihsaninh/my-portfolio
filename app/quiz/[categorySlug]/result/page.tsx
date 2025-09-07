"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Card } from "@/src/components/quiz";
import {
  DEFAULT_LANGUAGE,
  getPerformanceCategoryLabel,
  getTranslation,
  Language,
} from "@/src/lib/i18n";
import { LeaderboardEntry, QuizCategory, QuizSession } from "@/src/types/quiz";

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.categorySlug as string;

  const [quizResult, setQuizResult] = useState<QuizSession | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const t = getTranslation(language);

  useEffect(() => {
    const initializeResults = async () => {
      try {
        // Get quiz result from localStorage
        const resultData = localStorage.getItem("quizResult");
        const savedLanguage = localStorage.getItem("quizLanguage") as Language;

        if (!resultData) {
          router.push("/quiz");
          return;
        }

        if (savedLanguage) {
          setLanguage(savedLanguage);
        }

        const result: QuizSession = JSON.parse(resultData);

        // Convert string dates back to Date objects
        if (result.startTime) {
          result.startTime = new Date(result.startTime);
        }
        if (result.endTime) {
          result.endTime = new Date(result.endTime);
        }

        // Convert answer timestamps back to Date objects
        if (result.answers) {
          result.answers = result.answers.map((answer) => ({
            ...answer,
            timestamp: new Date(answer.timestamp),
          }));
        }

        setQuizResult(result);

        // Fetch category details
        const categoriesResponse = await fetch("/api/quiz/categories");
        if (categoriesResponse.ok) {
          const categories = await categoriesResponse.json();
          const currentCategory = categories.find(
            (cat: QuizCategory) => cat.slug === categorySlug
          );
          setCategory(currentCategory);
        }

        // Fetch leaderboard to calculate rank
        const leaderboardResponse = await fetch("/api/quiz/leaderboard");
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          const userScore = Math.round(
            (result.totalScore / result.maxScore) * 100
          );

          // Find user's rank (approximate)
          const betterScores = leaderboardData.filter(
            (entry: LeaderboardEntry) => entry.percentage > userScore
          );
          setUserRank(betterScores.length + 1);
        }
      } catch (error) {
        console.error("Failed to initialize results:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeResults();
  }, [router, categorySlug]);

  const handleViewLeaderboard = () => {
    router.push("/quiz/leaderboard");
  };

  const handleTryAgain = () => {
    // Clear the result and go back to categories
    localStorage.removeItem("quizResult");
    router.push("/quiz/categories");
  };

  const handleNewQuiz = () => {
    localStorage.removeItem("quizResult");
    router.push("/quiz");
  };

  if (!quizResult || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            {language === "id" ? "Memuat hasil..." : "Loading results..."}
          </h2>
        </div>
      </div>
    );
  }

  const finalScore = Math.round(
    (quizResult.totalScore / quizResult.maxScore) * 100
  );
  const averageScore = Math.round(
    quizResult.totalScore / quizResult.answers.length
  );

  const getScoreMessage = (score: number) => {
    if (score >= 90)
      return { message: "Outstanding! 🏆", color: "text-yellow-500" };
    if (score >= 80)
      return { message: "Excellent! 🌟", color: "text-green-500" };
    if (score >= 70)
      return { message: "Great job! 👏", color: "text-blue-500" };
    if (score >= 60)
      return { message: "Good work! 👍", color: "text-purple-500" };
    return { message: "Keep practicing! 💪", color: "text-orange-500" };
  };

  const scoreMessage = getScoreMessage(finalScore);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Celebratory Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Confetti-like particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: [
                "#10B981",
                "#3B82F6",
                "#8B5CF6",
                "#F59E0B",
                "#EF4444",
              ][i % 5],
              left: `${Math.random() * 100}%`,
              top: `-10px`,
            }}
            animate={{
              y: [0, window.innerHeight + 100],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Background gradient animation */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 40% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Celebration Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-12"
            >
              {/* Trophy Animation */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-8"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="text-6xl"
                  >
                    🏆
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4"
              >
                {t.congratulations}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className={`text-2xl font-semibold mb-2 ${scoreMessage.color}`}
              >
                {scoreMessage.message}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-lg text-slate-600 dark:text-slate-300"
              >
                {quizResult.playerName},{" "}
                {language === "id"
                  ? `Anda mencetak skor di kategori ${category?.name}`
                  : `you scored in the ${category?.name} category`}
              </motion.p>
            </motion.div>

            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mb-12"
            >
              <Card variant="gradient" padding="lg" className="text-center">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {t.finalScore}
                    </h2>
                    <div className="text-7xl font-bold text-accent mb-4">
                      {finalScore}
                      <span className="ml-2 align-top text-sm text-slate-500 dark:text-slate-400">/100</span>
                    </div>

                    {userRank && (
                      <div className="text-lg text-slate-600 dark:text-slate-300">
                        {language === "id"
                          ? "Peringkat Papan:"
                          : "Leaderboard Rank:"}{" "}
                        <span className="font-bold text-accent">
                          #{userRank}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {quizResult.answers.length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {language === "id"
                          ? "Pertanyaan Terjawab"
                          : "Questions Answered"}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {averageScore}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {language === "id"
                          ? "Rata-rata per Pertanyaan"
                          : "Average per Question"}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.round(
                          (quizResult.endTime!.getTime() -
                            quizResult.startTime.getTime()) /
                            1000 /
                            60
                        )}
                        min
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {language === "id" ? "Waktu Digunakan" : "Time Taken"}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mb-8"
            >
              <Card variant="glass" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="M4.93 4.93l1.41 1.41" />
                      <path d="M17.66 17.66l1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="M4.93 19.07l1.41-1.41" />
                      <path d="M17.66 6.34l1.41-1.41" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {t.aiFeedbackSummary}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {finalScore >= 80
                        ? t.aiFeedbackMessages.excellent
                        : finalScore >= 60
                        ? t.aiFeedbackMessages.good
                        : t.aiFeedbackMessages.average}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails
                        ? t.hideDetailedFeedback
                        : t.viewDetailedFeedback}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Detailed Feedback */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <Card variant="default" padding="lg">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      {t.questionByQuestionFeedback}
                    </h3>
                    <div className="space-y-6">
                      {quizResult.answers.map((answer, index) => (
                        <div
                          key={answer.questionId}
                          className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {t.question} {index + 1}
                            </h4>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-accent">
                                {answer.score}
                              </div>
                              <div className="text-xs text-slate-500">
                                / 100
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                            {quizResult.questions[index]?.question}
                          </p>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <strong>{t.yourAnswerLabel}</strong>{" "}
                              {answer.answer.substring(0, 100)}
                              {answer.answer.length > 100 && "..."}
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            💬 {answer.feedback}
                          </p>

                          {/* Enhanced AI Feedback */}
                          {answer.detailedFeedback && (
                            <div className="mt-4 space-y-3">
                              {answer.detailedFeedback.strengths.length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                  <h5 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                                    ✅ {t.strengths}
                                  </h5>
                                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                                    {answer.detailedFeedback.strengths.map(
                                      (strength, idx) => (
                                        <li key={idx}>• {strength}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {answer.detailedFeedback.improvements.length >
                                0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                  <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    📈 {t.areasForImprovement}
                                  </h5>
                                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    {answer.detailedFeedback.improvements.map(
                                      (improvement, idx) => (
                                        <li key={idx}>• {improvement}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  {t.aiAssessment}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    answer.detailedFeedback.category ===
                                    "excellent"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                      : answer.detailedFeedback.category ===
                                        "good"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                      : answer.detailedFeedback.category ===
                                        "average"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                  }`}
                                >
                                  {getPerformanceCategoryLabel(
                                    answer.detailedFeedback.category,
                                    language
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={handleViewLeaderboard}
                className="flex-1 sm:flex-none"
              >
                {t.viewLeaderboard}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleTryAgain}
                className="flex-1 sm:flex-none"
              >
                {t.tryAgainInCategory} {category?.name}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleNewQuiz}
                className="flex-1 sm:flex-none"
              >
                {t.startNewQuiz}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
