"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  LoadingAnimation,
  ProgressBar,
} from "@/src/components/quiz";
import {
  DEFAULT_LANGUAGE,
  getDifficultyLabel,
  getTranslation,
  Language,
} from "@/src/lib/i18n";
import { QuizAnswer, QuizQuestion, QuizSession } from "@/src/types/quiz";

export default function QuizPlayPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.categorySlug as string;

  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
  } | null>(null);
  const initializeRef = useRef(false);

  const t = getTranslation(language);

  useEffect(() => {
    // Prevent double execution in Strict Mode and multiple calls
    if (initializeRef.current) return;

    const initializeQuiz = async () => {
      try {
        initializeRef.current = true;

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

        // Fetch questions for this category with language
        const response = await fetch(
          `/api/quiz/categories/${categorySlug}/questions?language=${savedLanguage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();

        if (!data.category || !data.questions || data.questions.length === 0) {
          throw new Error("No questions found for this category");
        }

        setCategory(data.category);
        // We don't need to store questions separately since they're in the session

        // Create quiz session via API
        const sessionResponse = await fetch("/api/quiz/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categorySlug,
            playerName: name,
          }),
        });

        if (!sessionResponse.ok) {
          throw new Error("Failed to create quiz session");
        }

        const sessionData = await sessionResponse.json();

        // Initialize local quiz session
        const session: QuizSession = {
          id: sessionData.sessionId,
          playerName: name,
          categoryId: data.category.id,
          categorySlug: categorySlug,
          questions: data.questions,
          answers: [],
          currentQuestionIndex: 0,
          totalScore: 0,
          maxScore: data.questions.length * 100,
          isCompleted: false,
          startTime: new Date(),
        };

        setQuizSession(session);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize quiz"
        );
        initializeRef.current = false; // Reset on error to allow retry
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();

    // Cleanup function
    return () => {
      // Reset ref when component unmounts or categorySlug changes
      initializeRef.current = false;
    };
  }, [categorySlug, router]); // Include router in dependencies

  const simulateAIEvaluation = async (
    sessionId: string,
    question: QuizQuestion,
    answer: string
  ): Promise<{
    score: number;
    feedback: string;
    detailedFeedback?: {
      strengths: string[];
      improvements: string[];
      category: "excellent" | "good" | "average" | "poor";
    };
  }> => {
    try {
      // Submit answer to API for AI evaluation
      const response = await fetch(`/api/quiz/sessions/${sessionId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim(),
          question_data: {
            prompt: question.prompt || question.question,
            category: category?.name?.toLowerCase() || "general",
            difficulty: question.difficulty || 2,
            rubric_json: question.rubric_json,
            language: language, // Pass the selected language
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const result = await response.json();
      return {
        score: result.score,
        feedback: result.feedback,
        detailedFeedback: result.detailedFeedback,
      };
    } catch (error) {
      console.error("AI evaluation failed:", error);
      // Fallback to simple simulation
      const wordCount = answer.trim().split(/\s+/).length;
      const hasKeywords =
        answer.toLowerCase().includes("because") ||
        answer.toLowerCase().includes("example") ||
        answer.toLowerCase().includes("however") ||
        answer.toLowerCase().includes("therefore");

      let score = 0;
      let feedback = "Answer submitted successfully!";

      if (wordCount >= 50 && hasKeywords) {
        score = 85 + Math.floor(Math.random() * 15);
        feedback =
          "Excellent! Your answer was comprehensive and well-structured.";
      } else if (wordCount >= 30) {
        score = 70 + Math.floor(Math.random() * 15);
        feedback = "Good answer! You covered the main points effectively.";
      } else if (wordCount >= 15) {
        score = 50 + Math.floor(Math.random() * 20);
        feedback = "Decent answer, but could use more detail.";
      } else {
        score = 20 + Math.floor(Math.random() * 30);
        feedback =
          "This needs improvement. Consider researching the topic more.";
      }

      return { score, feedback };
    }
  };

  const handleSubmitAnswer = async () => {
    if (!quizSession || !currentAnswer.trim()) return;

    setIsSubmitting(true);

    try {
      const currentQuestion =
        quizSession.questions[quizSession.currentQuestionIndex];
      const evaluation = await simulateAIEvaluation(
        quizSession.id,
        currentQuestion,
        currentAnswer
      );

      const answer: QuizAnswer = {
        questionId: currentQuestion.id,
        answer: currentAnswer.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        timestamp: new Date(),
        detailedFeedback: evaluation.detailedFeedback,
      };

      const updatedSession: QuizSession = {
        ...quizSession,
        answers: [...quizSession.answers, answer],
        totalScore: quizSession.totalScore + evaluation.score,
        currentQuestionIndex: quizSession.currentQuestionIndex + 1,
      };

      // Check if quiz is completed
      if (
        updatedSession.currentQuestionIndex >= updatedSession.questions.length
      ) {
        updatedSession.isCompleted = true;
        updatedSession.endTime = new Date();

        // Store result in localStorage
        localStorage.setItem("quizResult", JSON.stringify(updatedSession));

        // Redirect to result page
        router.push(`/quiz/${categorySlug}/result`);
      } else {
        setQuizSession(updatedSession);
        setCurrentAnswer("");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setIsSubmitting(false);
      // You might want to show an error message to the user here
    }
  };

  const handleBack = () => {
    router.push("/quiz/categories");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <LoadingAnimation type="spinner" message={t.loading} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {language === "id" ? "Error Memuat Kuis" : "Error Loading Quiz"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/quiz/categories")}>
            {language === "id" ? "Kembali ke Kategori" : "Back to Categories"}
          </Button>
        </div>
      </div>
    );
  }

  if (!quizSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <LoadingAnimation type="spinner" message={t.loading} />
      </div>
    );
  }

  const currentQuestion =
    quizSession.questions[quizSession.currentQuestionIndex];
  const progress =
    (quizSession.currentQuestionIndex / quizSession.questions.length) * 100;

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
              ←{" "}
              {language === "id" ? "Kembali ke Kategori" : "Back to Categories"}
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
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category?.color} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-2xl">{category?.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {category?.name} | {t.question}{" "}
                    {quizSession.currentQuestionIndex + 1} {t.of}{" "}
                    {quizSession.questions.length}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t.playingAs}{" "}
                    <span className="text-accent font-medium">
                      {playerName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                progress={progress}
                showLabel
                className="max-w-md mx-auto"
                animated={false}
              />
            </motion.div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={quizSession.currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Card variant="gradient" padding="lg">
                  <div className="space-y-6">
                    {/* Question */}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                        {currentQuestion.prompt}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getDifficultyLabel(
                              typeof currentQuestion.difficulty === "number"
                                ? currentQuestion.difficulty
                                : 2,
                              language
                            ) === (language === "id" ? "mudah" : "easy")
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : getDifficultyLabel(
                                  typeof currentQuestion.difficulty === "number"
                                    ? currentQuestion.difficulty
                                    : 2,
                                  language
                                ) === (language === "id" ? "sedang" : "medium")
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {getDifficultyLabel(
                            typeof currentQuestion.difficulty === "number"
                              ? currentQuestion.difficulty
                              : 2,
                            language
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {language === "id"
                            ? "Pertanyaan terbuka"
                            : "Open-ended question"}
                        </span>
                      </div>
                    </div>

                    {/* Answer Input */}
                    <div>
                      <label
                        htmlFor="answer"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        {t.yourAnswer}
                      </label>
                      <textarea
                        id="answer"
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder={t.answerPlaceholder}
                        className="w-full h-40 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 resize-none"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t.characters} {currentAnswer.length} •{" "}
                        {t.minRecommended}
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        size="lg"
                        onClick={handleSubmitAnswer}
                        disabled={!currentAnswer.trim() || isSubmitting}
                        isLoading={isSubmitting}
                        className="min-w-[200px]"
                      >
                        {isSubmitting ? t.aiEvaluating : t.submitAnswer}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Card variant="glass" className="max-w-md mx-auto">
                    <LoadingAnimation
                      type="thinking"
                      message={t.aiEvaluating}
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
                      {language === "id"
                        ? "Ini mungkin membutuhkan beberapa detik..."
                        : "This may take a few seconds..."}
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
            >
              <Card variant="glass" padding="sm" className="text-center">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {quizSession.answers.length}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {t.answered}
                </div>
              </Card>

              <Card variant="glass" padding="sm" className="text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {quizSession.answers.length > 0
                    ? Math.round(
                        quizSession.totalScore / quizSession.answers.length
                      )
                    : 0}
                  <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                    /100
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {t.avgScore}
                </div>
              </Card>

              <Card variant="glass" padding="sm" className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {quizSession.questions.length -
                    quizSession.currentQuestionIndex}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {t.remaining}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
