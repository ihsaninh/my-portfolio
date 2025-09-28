export interface QuizCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  prompt?: string; // From database
  question?: string; // Legacy field, alias for prompt
  categoryId?: string; // Legacy field
  category_id?: string; // Database field
  difficulty?: number | string; // Support both number (db) and string (legacy)
  type?: string;
  language?: string; // Language code (en, id)
  options?: string[]; // For multiple choice questions
  correctAnswer?: string; // For multiple choice questions
  rubric_json?: Record<string, unknown> | null;
  is_active?: boolean;
  created_at?: string;
}

export interface QuizSession {
  id: string;
  playerName: string;
  categoryId: string;
  categorySlug: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  totalScore: number;
  maxScore: number;
  isCompleted: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  score: number;
  feedback: string;
  timestamp: Date;
  detailedFeedback?: {
    strengths: string[];
    improvements: string[];
    category: "excellent" | "good" | "average" | "poor";
  };
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  categoryId: string;
  categoryName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: Date;
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  categoriesCompleted: string[];
}

export type QuizMode = "practice" | "challenge";
export type LeaderboardView = "global" | "category";

export interface QuizSettings {
  questionsPerQuiz: number;
  timeLimit?: number; // in seconds
  mode: QuizMode;
}
