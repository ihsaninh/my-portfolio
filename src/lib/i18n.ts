// Language configuration for the quiz application
export type Language = "en" | "id";

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    nativeName: "English",
  },
  {
    code: "id",
    name: "Indonesian",
    flag: "🇮🇩",
    nativeName: "Bahasa Indonesia",
  },
];

export const DEFAULT_LANGUAGE: Language = "en";

// Translation keys and values
export interface QuizTranslations {
  // Common
  back: string;
  next: string;
  submit: string;
  loading: string;
  error: string;
  tryAgain: string;

  // Quiz Start
  selectLanguage: string;
  languagePrompt: string;
  enterName: string;
  namePlaceholder: string;
  startQuiz: string;

  // Categories
  selectCategory: string;
  welcomeMessage: string;
  questionsPerQuiz: string;
  aiFeedback: string;

  // Quiz Play
  question: string;
  of: string;
  playingAs: string;
  yourAnswer: string;
  answerPlaceholder: string;
  characters: string;
  minRecommended: string;
  submitAnswer: string;
  aiEvaluating: string;
  answered: string;
  avgScore: string;
  remaining: string;

  // Difficulty levels
  easy: string;
  medium: string;
  hard: string;

  // Quiz Results
  congratulations: string;
  quizCompleted: string;
  finalScore: string;
  aiFeedbackSummary: string;
  viewDetailedFeedback: string;
  hideDetailedFeedback: string;
  questionByQuestionFeedback: string;
  yourAnswerLabel: string;
  strengths: string;
  areasForImprovement: string;
  aiAssessment: string;

  // Performance categories
  excellent: string;
  good: string;
  average: string;
  poor: string;

  // Actions
  viewLeaderboard: string;
  tryAgainInCategory: string;
  startNewQuiz: string;

  // Leaderboard
  quizLeaderboard: string;
  seeHowYouStackUp: string;
  yourStats: string;
  globalRank: string;
  bestScore: string;
  globalRankings: string;
  categoryRankings: string;
  allCategories: string;
  backToQuiz: string;
  points: string;

  // AI Feedback
  aiFeedbackMessages: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
}

export const translations: Record<Language, QuizTranslations> = {
  en: {
    // Common
    back: "Back",
    next: "Next",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    tryAgain: "Try Again",

    // Quiz Start
    selectLanguage: "Select Language",
    languagePrompt: "Choose your preferred language for the quiz",
    enterName: "Enter Your Name",
    namePlaceholder: "Your name...",
    startQuiz: "Start Quiz",

    // Categories
    selectCategory: "Select a Quiz Category",
    welcomeMessage: "Welcome",
    questionsPerQuiz: "Per quiz session",
    aiFeedback: "Instant evaluation",

    // Quiz Play
    question: "Question",
    of: "of",
    playingAs: "Playing as:",
    yourAnswer: "Your Answer",
    answerPlaceholder: "Type your answer here...",
    characters: "Characters:",
    minRecommended: "Min. 10 characters recommended",
    submitAnswer: "Submit Answer 🚀",
    aiEvaluating: "AI is evaluating...",
    answered: "Answered",
    avgScore: "Avg Score",
    remaining: "Remaining",

    // Difficulty levels
    easy: "easy",
    medium: "medium",
    hard: "hard",

    // Quiz Results
    congratulations: "Congratulations!",
    quizCompleted: "Quiz Completed",
    finalScore: "Final Score",
    aiFeedbackSummary: "AI Feedback Summary",
    viewDetailedFeedback: "View Detailed Feedback",
    hideDetailedFeedback: "Hide Detailed Feedback",
    questionByQuestionFeedback: "Question-by-Question Feedback",
    yourAnswerLabel: "Your answer:",
    strengths: "Strengths",
    areasForImprovement: "Areas for Improvement",
    aiAssessment: "AI Assessment:",

    // Performance categories
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    poor: "Poor",

    // Actions
    viewLeaderboard: "View Leaderboard 🏆",
    tryAgainInCategory: "Try Again in",
    startNewQuiz: "Start New Quiz",

    // Leaderboard
    quizLeaderboard: "Quiz Leaderboard",
    seeHowYouStackUp: "See how you stack up against other quiz takers!",
    yourStats: "Your Stats",
    globalRank: "Global Rank",
    bestScore: "Best Score",
    globalRankings: "Global Rankings",
    categoryRankings: "Category Rankings",
    allCategories: "All Categories",
    backToQuiz: "Back to Quiz",
    points: "points",

    // AI Feedback
    aiFeedbackMessages: {
      excellent:
        "Excellent work! Your answers showed deep understanding and clear explanations. Keep up the great work!",
      good: "Good job! Your answers were solid. Consider adding more examples and detail to improve further.",
      average:
        "Nice effort! Focus on providing more comprehensive explanations and examples in your answers.",
      poor: "Keep practicing! Try to provide more detailed explanations and relevant examples in your future answers.",
    },
  },
  id: {
    // Common
    back: "Kembali",
    next: "Lanjut",
    submit: "Kirim",
    loading: "Lagi dimuat...",
    error: "Ups, ada yang salah",
    tryAgain: "Coba lagi",

    // Quiz Start
    selectLanguage: "Pilih Bahasa",
    languagePrompt: "Mau main pakai bahasa apa?",
    enterName: "Masukkan Namamu",
    namePlaceholder: "Nama kamu...",
    startQuiz: "Mulai Kuis 🚀",

    // Categories
    selectCategory: "Pilih Kategori",
    welcomeMessage: "Halo!",
    questionsPerQuiz: "per sesi kuis",
    aiFeedback: "Dinilai otomatis sama AI",

    // Quiz Play
    question: "Pertanyaan",
    of: "dari",
    playingAs: "Main sebagai:",
    yourAnswer: "Jawabanmu",
    answerPlaceholder: "Tulis jawabanmu di sini...",
    characters: "Karakter:",
    minRecommended: "Minimal 10 karakter ya",
    submitAnswer: "Kirim Jawaban 🚀",
    aiEvaluating: "AI lagi ngecek jawabanmu...",
    answered: "Terjawab",
    avgScore: "Skor Rata-rata",
    remaining: "Sisa",

    // Difficulty levels
    easy: "mudah",
    medium: "sedang",
    hard: "sulit",

    // Quiz Results
    congratulations: "Selamat! 🎉",
    quizCompleted: "Kuis Selesai!",
    finalScore: "Skor Akhir",
    aiFeedbackSummary: "Ringkasan Feedback AI",
    viewDetailedFeedback: "Lihat Feedback Lengkap",
    hideDetailedFeedback: "Sembunyikan Feedback",
    questionByQuestionFeedback: "Feedback per Pertanyaan",
    yourAnswerLabel: "Jawabanmu:",
    strengths: "Yang Keren",
    areasForImprovement: "Yang Bisa Ditingkatkan",
    aiAssessment: "Penilaian AI:",

    // Performance categories
    excellent: "Keren Banget",
    good: "Mantap",
    average: "Lumayan",
    poor: "Perlu Latihan",

    // Actions
    viewLeaderboard: "Lihat Leaderboard 🏆",
    tryAgainInCategory: "Coba lagi di",
    startNewQuiz: "Main Lagi",

    // Leaderboard
    quizLeaderboard: "Leaderboard",
    seeHowYouStackUp: "Lihat posisi kamu dibanding pemain lain!",
    yourStats: "Statistikmu",
    globalRank: "Peringkat Global",
    bestScore: "Skor Terbaik",
    globalRankings: "Peringkat Global",
    categoryRankings: "Peringkat Kategori",
    allCategories: "Semua Kategori",
    backToQuiz: "Kembali ke Kuis",
    points: "poin",

    // AI Feedback
    aiFeedbackMessages: {
      excellent:
        "Wuih! Jawabanmu mantap, jelas, lengkap, dan mengena. Pertahankan!",
      good: "Good job! Udah oke. Tambahin contoh biar makin nendang, ya.",
      average: "Lumayan! Coba tambahin detail dan contoh biar lebih kuat.",
      poor: "Belum pas. Tenang, coba jawab lebih jelas + kasih contoh ya!",
    },
  },
};

// Helper functions
export function getTranslation(language: Language): QuizTranslations {
  return translations[language] || translations[DEFAULT_LANGUAGE];
}

export function getDifficultyLabel(
  difficulty: number,
  language: Language
): string {
  const t = getTranslation(language);
  switch (difficulty) {
    case 1:
      return t.easy;
    case 2:
      return t.medium;
    case 3:
      return t.hard;
    default:
      return t.medium;
  }
}

export function getPerformanceCategoryLabel(
  category: string,
  language: Language
): string {
  const t = getTranslation(language);
  switch (category) {
    case "excellent":
      return t.excellent;
    case "good":
      return t.good;
    case "average":
      return t.average;
    case "poor":
      return t.poor;
    default:
      return t.average;
  }
}
