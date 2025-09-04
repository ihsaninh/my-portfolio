import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Define the scoring schema for structured output
const ScoringSchema = z.object({
  score: z.number().min(0).max(100).describe("Score between 0-100"),
  feedback: z.string().describe("Detailed feedback explaining the score"),
  strengths: z.array(z.string()).describe("Key strengths in the answer"),
  improvements: z.array(z.string()).describe("Areas for improvement"),
  category: z
    .enum(["excellent", "good", "average", "poor"])
    .describe("Overall performance category"),
});

export type AIScoreResult = z.infer<typeof ScoringSchema>;

// Difficulty-based scoring adjustments
const DIFFICULTY_MULTIPLIERS = {
  1: 1.0, // easy
  2: 1.1, // medium
  3: 1.2, // hard
} as const;

// Category-specific evaluation criteria
const CATEGORY_CRITERIA = {
  tech: {
    focus:
      "technical accuracy, depth of understanding, practical examples, and industry best practices",
    keywords: [
      "implementation",
      "architecture",
      "performance",
      "scalability",
      "security",
      "best practices",
    ],
  },
  career: {
    focus:
      "professional insight, practical experience, leadership qualities, and problem-solving approach",
    keywords: [
      "leadership",
      "collaboration",
      "problem-solving",
      "growth",
      "experience",
      "teamwork",
    ],
  },
  fun: {
    focus:
      "creativity, thoughtfulness, personality expression, and engaging storytelling",
    keywords: [
      "creativity",
      "personality",
      "storytelling",
      "uniqueness",
      "engagement",
      "authenticity",
    ],
  },
} as const;

export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  category: string;
  difficulty: number;
  language?: string;
  rubric?: Record<string, unknown>;
}): Promise<AIScoreResult> {
  const {
    question,
    answer,
    category,
    difficulty,
    language = "en",
    rubric,
  } = params;

  try {
    // Get category-specific criteria
    const categoryKey =
      category.toLowerCase() as keyof typeof CATEGORY_CRITERIA;
    const criteria = CATEGORY_CRITERIA[categoryKey] || CATEGORY_CRITERIA.tech;

    // Build the evaluation prompt based on language
    const isIndonesian = language === "id";
    const prompt = isIndonesian
      ? `Anda adalah evaluator ahli untuk jawaban kuis. Silakan evaluasi jawaban berikut secara komprehensif dalam bahasa Indonesia.

**Pertanyaan:** ${question}

**Kategori:** ${category} (${getDifficultyLabel(difficulty, language)})
**Area Fokus:** ${criteria.focus}
**Area Penilaian Utama:** ${criteria.keywords.join(", ")}

**Jawaban Siswa:**
${answer}

**Panduan Evaluasi:**
1. **Kualitas Konten (40%):** Akurasi, kelengkapan, dan relevansi dengan pertanyaan
2. **Kedalaman & Pemahaman (25%):** Menunjukkan pemahaman sejati vs pengetahuan dangkal
3. **Komunikasi (20%):** Kejelasan, struktur, dan ekspresi profesional
4. **Aplikasi Praktis (15%):** Contoh dunia nyata, wawasan yang dapat ditindaklanjuti, atau detail implementasi

**Skala Penilaian:**
- 90-100: Luar Biasa - Menunjukkan penguasaan dengan wawasan dan contoh yang sangat baik
- 80-89: Baik - Pemahaman solid dengan penjelasan yang baik dan beberapa contoh
- 70-79: Memuaskan - Pemahaman dasar dengan penjelasan yang memadai
- 60-69: Perlu Perbaikan - Pemahaman terbatas atau penjelasan yang tidak jelas
- Di bawah 60: Kurang - Pemahaman tidak memadai atau respons di luar topik

${rubric ? `**Rubrik Tambahan:** ${JSON.stringify(rubric)}` : ""}

Berikan evaluasi komprehensif dengan feedback spesifik dan dapat ditindaklanjuti dalam bahasa Indonesia.`
      : `You are an expert evaluator for quiz answers. Please evaluate the following answer comprehensively.

**Question:** ${question}

**Category:** ${category} (${getDifficultyLabel(difficulty, language)})
**Focus Areas:** ${criteria.focus}
**Key Areas to Assess:** ${criteria.keywords.join(", ")}

**Student's Answer:**
${answer}

**Evaluation Guidelines:**
1. **Content Quality (40%):** Accuracy, completeness, and relevance to the question
2. **Depth & Understanding (25%):** Shows genuine understanding vs. surface-level knowledge
3. **Communication (20%):** Clarity, structure, and professional expression
4. **Practical Application (15%):** Real-world examples, actionable insights, or implementation details

**Scoring Scale:**
- 90-100: Exceptional - Demonstrates mastery with excellent insights and examples
- 80-89: Good - Solid understanding with good explanations and some examples
- 70-79: Satisfactory - Basic understanding with adequate explanation
- 60-69: Needs Improvement - Limited understanding or unclear explanation
- Below 60: Poor - Insufficient understanding or off-topic response

${rubric ? `**Additional Rubric:** ${JSON.stringify(rubric)}` : ""}

Please provide a comprehensive evaluation with specific, actionable feedback.`;

    const result = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: ScoringSchema,
      prompt,
      temperature: 0.3, // Lower temperature for more consistent scoring
    });

    // Apply difficulty multiplier (slight boost for harder questions)
    const difficultyMultiplier =
      DIFFICULTY_MULTIPLIERS[
        difficulty as keyof typeof DIFFICULTY_MULTIPLIERS
      ] || 1.0;
    const adjustedScore = Math.min(
      100,
      Math.round(result.object.score * difficultyMultiplier)
    );

    return {
      ...result.object,
      score: adjustedScore,
    };
  } catch (error) {
    console.error("AI evaluation failed:", error);

    // Fallback to rule-based scoring
    return generateFallbackScore(answer, category, difficulty, language);
  }
}

function getDifficultyLabel(
  difficulty: number,
  language: string = "en"
): string {
  const isIndonesian = language === "id";

  switch (difficulty) {
    case 1:
      return isIndonesian ? "Mudah" : "Easy";
    case 2:
      return isIndonesian ? "Sedang" : "Medium";
    case 3:
      return isIndonesian ? "Sulit" : "Hard";
    default:
      return isIndonesian ? "Sedang" : "Medium";
  }
}

function generateFallbackScore(
  answer: string,
  category: string,
  difficulty: number,
  language: string = "en"
): AIScoreResult {
  const isIndonesian = language === "id";
  const wordCount = answer.trim().split(/\s+/).length;
  const sentences = answer
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  // Category-specific keyword analysis
  const categoryKey = category.toLowerCase() as keyof typeof CATEGORY_CRITERIA;
  const criteria = CATEGORY_CRITERIA[categoryKey] || CATEGORY_CRITERIA.tech;
  const keywordMatches = criteria.keywords.filter((keyword) =>
    answer.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  // Quality indicators
  const hasExamples = /for example|such as|like|including/i.test(answer);
  const hasStructure =
    /first|second|additionally|furthermore|however|therefore/i.test(answer);
  const hasProfessionalTone = wordCount >= 20 && sentences >= 2;

  // Calculate base score
  let score = 30; // Base score

  // Word count scoring (0-25 points)
  if (wordCount >= 100) score += 25;
  else if (wordCount >= 50) score += 20;
  else if (wordCount >= 30) score += 15;
  else if (wordCount >= 15) score += 10;

  // Keyword relevance (0-20 points)
  score += Math.min(20, keywordMatches * 5);

  // Quality indicators (0-25 points)
  if (hasExamples) score += 8;
  if (hasStructure) score += 8;
  if (hasProfessionalTone) score += 9;

  // Adjust for difficulty
  const difficultyBonus = (difficulty - 1) * 5; // 0, 5, or 10 bonus points
  score = Math.min(100, score + difficultyBonus);

  // Determine category and feedback based on language
  let category_result: "excellent" | "good" | "average" | "poor";
  let feedback: string;
  let strengths: string[] = [];
  let improvements: string[] = [];

  if (score >= 85) {
    category_result = "excellent";
    feedback = isIndonesian
      ? "Respons yang luar biasa! Anda menunjukkan pemahaman komprehensif dengan detail yang sangat baik dan komunikasi yang jelas."
      : "Outstanding response! You demonstrated comprehensive understanding with excellent detail and clear communication.";
    strengths = isIndonesian
      ? ["Cakupan komprehensif", "Komunikasi jelas", "Detail relevan"]
      : ["Comprehensive coverage", "Clear communication", "Relevant details"];
    improvements = isIndonesian
      ? ["Pertimbangkan untuk menambahkan contoh yang lebih spesifik"]
      : ["Consider adding more specific examples"];
  } else if (score >= 75) {
    category_result = "good";
    feedback = isIndonesian
      ? "Respons yang baik! Anda menunjukkan pemahaman solid dengan penjelasan yang memadai."
      : "Good response! You showed solid understanding with adequate explanation.";
    strengths = isIndonesian
      ? ["Pemahaman yang baik", "Detail memadai"]
      : ["Good understanding", "Adequate detail"];
    improvements = isIndonesian
      ? ["Tambahkan lebih banyak contoh", "Tingkatkan struktur"]
      : ["Add more examples", "Enhance structure"];
  } else if (score >= 60) {
    category_result = "average";
    feedback = isIndonesian
      ? "Respons yang memuaskan, tetapi bisa lebih mendalam dan menggunakan contoh."
      : "Satisfactory response, but could benefit from more depth and examples.";
    strengths = isIndonesian
      ? ["Pemahaman dasar ditunjukkan"]
      : ["Basic understanding shown"];
    improvements = isIndonesian
      ? [
          "Tambahkan lebih banyak detail",
          "Sertakan contoh",
          "Tingkatkan struktur",
        ]
      : ["Add more detail", "Include examples", "Improve structure"];
  } else {
    category_result = "poor";
    feedback = isIndonesian
      ? "Respons ini perlu perbaikan signifikan. Coba berikan penjelasan yang lebih komprehensif dengan contoh yang relevan."
      : "This response needs significant improvement. Try to provide more comprehensive explanations with relevant examples.";
    strengths = isIndonesian ? ["Upaya telah dilakukan"] : ["Attempt made"];
    improvements = isIndonesian
      ? [
          "Berikan lebih banyak detail",
          "Tambahkan contoh yang relevan",
          "Tingkatkan kejelasan",
          "Jawab pertanyaan lebih langsung",
        ]
      : [
          "Provide more detail",
          "Add relevant examples",
          "Improve clarity",
          "Address the question more directly",
        ];
  }

  return {
    score,
    feedback,
    strengths,
    improvements,
    category: category_result,
  };
}

// Helper function to validate environment
export function isAIAvailable(): boolean {
  return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}
