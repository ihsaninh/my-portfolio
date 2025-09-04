"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card } from "@/src/components/quiz";
import { QUIZ_SETTINGS } from "@/src/data/quiz";
import {
  DEFAULT_LANGUAGE,
  getTranslation,
  Language,
  SUPPORTED_LANGUAGES,
} from "@/src/lib/i18n";

export default function QuizLandingPage() {
  const [playerName, setPlayerName] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const t = getTranslation(selectedLanguage);

  const handleStart = async () => {
    if (!playerName.trim()) return;

    setIsLoading(true);

    // Simulate loading animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Store player name and language in localStorage for the session
    localStorage.setItem("quizPlayerName", playerName.trim());
    localStorage.setItem("quizLanguage", selectedLanguage);

    router.push("/quiz/categories");
  };

  const handleViewLeaderboard = () => {
    router.push("/quiz/leaderboard");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 40% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 blur-xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Header Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl">
                <motion.svg
                  className="w-12 h-12 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1" />
                  <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6" />
                </motion.svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight"
            >
              {selectedLanguage === "id" ? (
                <>
                  Tantang Diri Anda dengan{" "}
                  <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                    Kuis AI!
                  </span>
                </>
              ) : (
                <>
                  Challenge Yourself with{" "}
                  <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                    AI Quiz!
                  </span>
                </>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed"
            >
              {selectedLanguage === "id"
                ? "Uji pengetahuan Anda di berbagai kategori, dapatkan feedback AI instan, dan bersaing di papan peringkat!"
                : "Test your knowledge across various categories, get instant AI-powered feedback, and compete on the leaderboard!"}
            </motion.p>

            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card variant="gradient" className="max-w-md mx-auto mb-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStart();
                  }}
                  className="space-y-6"
                >
                  {/* Language Selection */}
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      {t.selectLanguage}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedLanguage === lang.code
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-slate-300 dark:border-slate-600 hover:border-accent/50"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium text-sm">
                              {lang.nativeName}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="playerName"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      {t.enterName}
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) =>
                        setPlayerName(
                          e.target.value.slice(0, QUIZ_SETTINGS.nameMaxLength)
                        )
                      }
                      placeholder={t.namePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                      maxLength={QUIZ_SETTINGS.nameMaxLength}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {playerName.length}/{QUIZ_SETTINGS.nameMaxLength}{" "}
                      {selectedLanguage === "id" ? "karakter" : "characters"}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!playerName.trim()}
                    isLoading={isLoading}
                  >
                    {isLoading
                      ? selectedLanguage === "id"
                        ? "Menyiapkan Kuis..."
                        : "Preparing Quiz..."
                      : t.startQuiz}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* View Leaderboard Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <button
                onClick={handleViewLeaderboard}
                className="text-accent hover:text-accent-hover font-medium transition-colors duration-200 underline decoration-2 underline-offset-4 hover:decoration-accent-hover"
              >
                {selectedLanguage === "id"
                  ? "Lihat Papan Peringkat 🏆"
                  : "View Leaderboard 🏆"}
              </button>
            </motion.div>

            {/* Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { icon: "🎯", label: "Quiz Categories", value: "3" },
                { icon: "⚡", label: "Questions per Quiz", value: "5" },
                { icon: "🧠", label: "AI-Powered", value: "Feedback" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  variant="glass"
                  padding="sm"
                  className="text-center"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
