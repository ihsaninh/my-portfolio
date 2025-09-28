"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Card } from "@/src/features/quiz/components";
import { QuizCategory } from "@/src/features/quiz/types/quiz";
import { DEFAULT_LANGUAGE, getTranslation, Language } from "@/src/shared/lib/i18n";

export default function CategoriesPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = getTranslation(language);

  useEffect(() => {
    // Get player name and language from localStorage
    const name = localStorage.getItem("quizPlayerName");
    const savedLanguage = localStorage.getItem("quizLanguage") as Language;

    if (!name) {
      router.push("/quiz");
      return;
    }

    setPlayerName(name);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/quiz/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  const handleCategorySelect = (categorySlug: string) => {
    router.push(`/quiz/${categorySlug}/play`);
  };

  const handleBack = () => {
    router.push("/quiz");
  };

  if (!playerName) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t.loading}</p>
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
            {t.error}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t.tryAgain}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 40% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        {/* Navigation */}
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={handleBack} className="mb-8">
              ← {t.back}
            </Button>
          </motion.div>
        </div>

        {/* Main Quiz Content */}
        <div className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {t.welcomeMessage},{" "}
                <span className="text-accent">{playerName}</span>! 👋
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {t.selectCategory}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {language === "id"
                  ? "Pilih topik favoritmu dan uji skill kamu!"
                  : "Choose your favorite topic and test your skills!"}
              </p>
            </motion.div>

            {/* Category Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    variant="gradient"
                    className="h-full cursor-pointer group transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-accent/20"
                    onClick={() => handleCategorySelect(category.slug)}
                  >
                    <div className="text-center space-y-6">
                      {/* Category Icon */}
                      <motion.div
                        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ rotate: 5 }}
                      >
                        <span className="text-4xl">{category.icon}</span>
                      </motion.div>

                      {/* Category Info */}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                          {category.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                          {category.description}
                        </p>
                      </div>

                      {/* Start Button */}
                      <Button
                        size="lg"
                        className="w-full group-hover:scale-105 transition-transform duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategorySelect(category.slug);
                        }}
                      >
                        {t.startQuiz}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <Card variant="glass" padding="sm" className="text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {language === "id" ? "5 Pertanyaan" : "5 Questions"}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t.questionsPerQuiz}
                </div>
              </Card>

              <Card variant="glass" padding="sm" className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {language === "id" ? "Feedback AI" : "AI Feedback"}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t.aiFeedback}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
