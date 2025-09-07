"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Card } from "@/src/components/quiz";
import { DEFAULT_LANGUAGE, getTranslation, Language } from "@/src/lib/i18n";
import { LeaderboardEntry, QuizCategory } from "@/src/types/quiz";

export default function LeaderboardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const t = getTranslation(language);

  // Helper to fetch leaderboard only
  const fetchLeaderboard = async (categoryId: string) => {
    try {
      setListLoading(true);

      const leaderboardUrl =
        categoryId === "all"
          ? "/api/quiz/leaderboard"
          : `/api/quiz/leaderboard?categoryId=${categoryId}`;

      const leaderboardResponse = await fetch(leaderboardUrl);
      if (!leaderboardResponse.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await leaderboardResponse.json();
      const finalLeaderboardData = Array.isArray(data) ? data : [];
      setLeaderboardData(finalLeaderboardData);

      // Update user rank/score
      const playerName = localStorage.getItem("quizPlayerName");
      if (playerName && Array.isArray(finalLeaderboardData)) {
        const userEntry = finalLeaderboardData.find(
          (entry: LeaderboardEntry) =>
            entry.playerName?.toLowerCase() === playerName.toLowerCase()
        );

        if (userEntry) {
          const rank =
            finalLeaderboardData.findIndex(
              (entry: LeaderboardEntry) => entry.id === userEntry.id
            ) + 1;
          setUserRank(rank);
          setUserScore(userEntry.score);
        } else {
          setUserRank(null);
          setUserScore(null);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setListLoading(false);
    }
  };

  // Initial load: language, categories, and initial leaderboard
  useEffect(() => {
    const init = async () => {
      try {
        const savedLanguage = localStorage.getItem("quizLanguage") as Language;
        if (savedLanguage) setLanguage(savedLanguage);

        const categoriesResponse = await fetch("/api/quiz/categories");
        if (!categoriesResponse.ok)
          throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        await fetchLeaderboard(selectedCategory);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize leaderboard"
        );
      } finally {
        setInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update leaderboard only when category changes
  useEffect(() => {
    if (!initializing) {
      fetchLeaderboard(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const getFilteredLeaderboard = (): LeaderboardEntry[] => {
    // Ensure leaderboardData is an array before calling slice
    if (!Array.isArray(leaderboardData)) {
      console.warn("leaderboardData is not an array:", leaderboardData);
      return [];
    }
    return leaderboardData.slice(0, 10);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
    }
  };

  const handleStartQuiz = () => {
    router.push("/quiz");
  };

  const handleBack = () => {
    router.push("/quiz");
  };

  const leaderboard = getFilteredLeaderboard();
  const isEmpty = leaderboard.length === 0;

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {language === "id"
              ? "Memuat papan peringkat..."
              : "Loading leaderboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {language === "id"
              ? "Error Memuat Papan Peringkat"
              : "Error Loading Leaderboard"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t.tryAgain}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {/* Navigation */}
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              ← {t.backToQuiz}
            </Button>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl mb-6">
                <motion.span
                  className="text-4xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  🏆
                </motion.span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {t.quizLeaderboard}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {t.seeHowYouStackUp}
              </p>
            </motion.div>

            {/* User Stats */}
            {userRank && userScore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <Card variant="gradient" className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {t.yourStats}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-accent mb-2">
                        #{userRank}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {t.globalRank}
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-accent mb-2">
                        {userScore}
                        <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
                          /100
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {t.avgScore}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <Card variant="glass" padding="sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {selectedCategory === "all"
                      ? t.globalRankings
                      : t.categoryRankings}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none pl-4 pr-12 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="all">{t.allCategories}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8"
            >
              <Card variant="default" padding="lg">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCategory === "all" ? (
                      t.globalRankings
                    ) : (
                      <>
                        {t.categoryRankings}{" "}
                        <span className="text-accent">
                          -{" "}
                          {
                            categories.find(
                              (cat) => cat.id === selectedCategory
                            )?.name
                          }
                        </span>
                      </>
                    )}
                  </h2>
                  {listLoading && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">
                        {language === "id"
                          ? "Memuat daftar..."
                          : "Loading list..."}
                      </span>
                    </div>
                  )}
                </div>

                {listLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : isEmpty ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {language === "id"
                        ? "Belum ada yang memimpin!"
                        : "No one has taken the lead yet!"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {language === "id"
                        ? "Jadilah yang pertama mencetak skor tinggi di kategori ini."
                        : "Be the first to set a high score in this category."}
                    </p>
                    <Button onClick={handleStartQuiz} size="lg">
                      {language === "id"
                        ? "Jadilah yang Pertama! 🚀"
                        : "Be the First! 🚀"}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                          index < 3
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200 dark:border-yellow-700"
                            : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(
                            index + 1
                          )}`}
                        >
                          {getRankIcon(index + 1)}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {entry.playerName}
                            </h3>
                            {index < 3 && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-yellow-500"
                              >
                                ✨
                              </motion.div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>{entry.categoryName}</span>
                            <span>•</span>
                            <span>
                              {new Date(entry.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Score (points) */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">
                            {entry.score}
                            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                              /100
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center"
            >
              <Card variant="gradient" className="max-w-md mx-auto">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🎯</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {language === "id"
                      ? "Siap Naik Peringkat?"
                      : "Ready to Climb the Ranks?"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {language === "id"
                      ? "Ikuti kuis sekarang dan lihat bagaimana posisi Anda!"
                      : "Take a quiz now and see how you compare!"}
                  </p>
                  <Button
                    onClick={handleStartQuiz}
                    size="lg"
                    className="w-full"
                  >
                    {t.startNewQuiz} 🚀
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
