import { LeaderboardEntry, QuizCategory, QuizQuestion } from "@/src/features/quiz/types/quiz";

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: "tech",
    name: "Tech",
    slug: "tech",
    description: "Test your technical knowledge and programming skills",
    icon: "🤖",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "career",
    name: "Career",
    slug: "career",
    description: "Professional development and career advancement topics",
    icon: "🚀",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "fun",
    name: "Fun",
    slug: "fun",
    description:
      "Light-hearted questions for entertainment and general knowledge",
    icon: "🎭",
    color: "from-green-500 to-emerald-500",
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Tech Category
  {
    id: "tech-1",
    categoryId: "tech",
    question:
      "Explain the concept of a virtual machine and how it differs from a container.",
    type: "open-ended",
    difficulty: "medium",
  },
  {
    id: "tech-2",
    categoryId: "tech",
    question: "What are the key principles of RESTful API design?",
    type: "open-ended",
    difficulty: "medium",
  },
  {
    id: "tech-3",
    categoryId: "tech",
    question: "Describe the difference between SQL and NoSQL databases.",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "tech-4",
    categoryId: "tech",
    question: "What is the purpose of version control systems like Git?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "tech-5",
    categoryId: "tech",
    question: "Explain the concept of microservices architecture.",
    type: "open-ended",
    difficulty: "hard",
  },

  // Career Category
  {
    id: "career-1",
    categoryId: "career",
    question:
      "How do you prioritize tasks when you have multiple deadlines approaching?",
    type: "open-ended",
    difficulty: "medium",
  },
  {
    id: "career-2",
    categoryId: "career",
    question:
      "Describe a time when you had to learn a new skill quickly for a project.",
    type: "open-ended",
    difficulty: "medium",
  },
  {
    id: "career-3",
    categoryId: "career",
    question:
      "What are your strategies for staying updated with industry trends?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "career-4",
    categoryId: "career",
    question:
      "How do you handle constructive criticism from colleagues or supervisors?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "career-5",
    categoryId: "career",
    question: "Describe your approach to mentoring junior team members.",
    type: "open-ended",
    difficulty: "hard",
  },

  // Fun Category
  {
    id: "fun-1",
    categoryId: "fun",
    question:
      "If you could have dinner with any historical figure, who would it be and why?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "fun-2",
    categoryId: "fun",
    question:
      "What would be your superpower of choice and how would you use it?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "fun-3",
    categoryId: "fun",
    question: "Describe your perfect weekend in three sentences.",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "fun-4",
    categoryId: "fun",
    question:
      "If you could live in any fictional universe, which would you choose?",
    type: "open-ended",
    difficulty: "easy",
  },
  {
    id: "fun-5",
    categoryId: "fun",
    question: "What is the most interesting fact you know?",
    type: "open-ended",
    difficulty: "easy",
  },
];

// Dummy leaderboard data
export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "1",
    playerName: "Alex Chen",
    categoryId: "tech",
    categoryName: "Tech",
    score: 95,
    maxScore: 100,
    percentage: 95,
    completedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: "2",
    playerName: "Sarah Johnson",
    categoryId: "career",
    categoryName: "Career",
    score: 92,
    maxScore: 100,
    percentage: 92,
    completedAt: new Date("2024-01-14T14:20:00Z"),
  },
  {
    id: "3",
    playerName: "Mike Rodriguez",
    categoryId: "tech",
    categoryName: "Tech",
    score: 88,
    maxScore: 100,
    percentage: 88,
    completedAt: new Date("2024-01-13T09:15:00Z"),
  },
  {
    id: "4",
    playerName: "Emily Wang",
    categoryId: "fun",
    categoryName: "Fun",
    score: 85,
    maxScore: 100,
    percentage: 85,
    completedAt: new Date("2024-01-12T16:45:00Z"),
  },
  {
    id: "5",
    playerName: "David Kim",
    categoryId: "career",
    categoryName: "Career",
    score: 82,
    maxScore: 100,
    percentage: 82,
    completedAt: new Date("2024-01-11T11:00:00Z"),
  },
  {
    id: "6",
    playerName: "Lisa Thompson",
    categoryId: "tech",
    categoryName: "Tech",
    score: 79,
    maxScore: 100,
    percentage: 79,
    completedAt: new Date("2024-01-10T13:30:00Z"),
  },
  {
    id: "7",
    playerName: "Carlos Martinez",
    categoryId: "fun",
    categoryName: "Fun",
    score: 76,
    maxScore: 100,
    percentage: 76,
    completedAt: new Date("2024-01-09T15:20:00Z"),
  },
  {
    id: "8",
    playerName: "Anna Kowalski",
    categoryId: "career",
    categoryName: "Career",
    score: 73,
    maxScore: 100,
    percentage: 73,
    completedAt: new Date("2024-01-08T12:10:00Z"),
  },
  {
    id: "9",
    playerName: "James Wilson",
    categoryId: "tech",
    categoryName: "Tech",
    score: 70,
    maxScore: 100,
    percentage: 70,
    completedAt: new Date("2024-01-07T08:45:00Z"),
  },
  {
    id: "10",
    playerName: "Maria Garcia",
    categoryId: "fun",
    categoryName: "Fun",
    score: 67,
    maxScore: 100,
    percentage: 67,
    completedAt: new Date("2024-01-06T17:00:00Z"),
  },
];

// AI Feedback templates
export const AI_FEEDBACK_TEMPLATES = {
  excellent: [
    "Excellent! Your answer was comprehensive and well-structured.",
    "Outstanding response! You demonstrated deep understanding.",
    "Brilliant! Your explanation was clear and detailed.",
  ],
  good: [
    "Good answer! You covered the main points effectively.",
    "Well done! Your response shows solid knowledge.",
    "Nice work! You explained the concept clearly.",
  ],
  average: [
    "Decent answer, but could use more detail.",
    "Good start, but try to elaborate more next time.",
    "Your answer is on the right track, but needs more depth.",
  ],
  poor: [
    "This needs improvement. Consider researching the topic more.",
    "Your answer is incomplete. Try to provide more examples.",
    "This could be better. Focus on the key concepts.",
  ],
};

export const QUIZ_SETTINGS = {
  questionsPerQuiz: 5,
  nameMaxLength: 20,
  answerTimeLimit: 300, // 5 minutes per question
  minAnswerLength: 10,
};
