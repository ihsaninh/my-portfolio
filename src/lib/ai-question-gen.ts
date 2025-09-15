import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Gemini requires object schemas to have at least one known property.
// Keep rubric_json lightweight but with defined keys.
const RubricSchema = z.object({
  criteria: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const GeneratedQuestionSchema = z.object({
  prompt: z.string().min(10),
  difficulty: z.number().int().min(1).max(3).default(2),
  rubric_json: RubricSchema.optional(),
  language: z.string().min(2).max(5).default("en"),
  category: z.string().min(1),
});

const GeneratedQuestionsSchema = z.array(GeneratedQuestionSchema);

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export async function generateQuestions(params: {
  topic?: string | null;
  categoryName?: string | null;
  categoryId?: string | null;
  language: string;
  num: number;
  seed?: string | number;
}): Promise<GeneratedQuestion[]> {
  const { topic, categoryName, categoryId, language, num, seed } = params;
  const categoryLabel = topic || categoryName || categoryId || "general";

  const prompt = `You are generating short, open-ended quiz questions.

Category: ${categoryLabel}
Language: ${language}
Count: ${num}
Seed: ${seed ?? "none"}

Rules:
- Output exactly ${num} items.
- Each item: concise "prompt" (1–2 sentences), integer "difficulty" 1..3, optional "rubric_json" (object with keys: criteria: string[], notes: string), copy "language", and string "category".
- Keep prompts diverse and unambiguous; avoid requiring code execution.
- Do not include any safety-violating content.
`;

  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    schema: GeneratedQuestionsSchema,
    prompt,
    temperature: 0.4,
  });

  // Stamp language/category
  const items = (result.object || []).map((q) => ({
    ...q,
    language,
    category: categoryLabel,
  }));

  return items.slice(0, num);
}

// MCQ generation
export const McqChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});
export const GeneratedMcqQuestionSchema = z.object({
  prompt: z.string().min(10),
  difficulty: z.number().int().min(1).max(3).default(2),
  language: z.string().min(2).max(5).default("en"),
  category: z.string().min(1),
  choices: z.array(McqChoiceSchema).min(3).max(6),
  correctChoiceId: z.string().min(1),
});

const GeneratedMcqQuestionsSchema = z.array(GeneratedMcqQuestionSchema);
export type GeneratedMcqQuestion = z.infer<typeof GeneratedMcqQuestionSchema>;

export async function generateMcqQuestions(params: {
  topic?: string | null;
  categoryName?: string | null;
  categoryId?: string | null;
  language: string;
  num: number;
  seed?: string | number;
}): Promise<GeneratedMcqQuestion[]> {
  const { topic, categoryName, categoryId, language, num, seed } = params;
  const categoryLabel = topic || categoryName || categoryId || "general";

  // Enhanced creative contexts for MCQ questions
  const creativeContexts = [
    "real-world application scenario",
    "historical case study context",
    "problem-solving situation",
    "comparative analysis format",
    "cause-and-effect relationship",
    "critical thinking challenge",
    "practical implementation example",
    "conceptual understanding test",
    "analytical reasoning question",
    "application-based scenario",
  ];

  const questionFormats = [
    "What would happen if...",
    "In a situation where..., which approach...",
    "When comparing X and Y, what is the key difference in...",
    "A professional needs to..., what should they consider first?",
    "Given the following scenario..., what is the best explanation for...",
    "If you were to implement..., which factor would be most critical?",
    "In the context of..., why does... occur?",
    "What is the primary reason that... leads to...?",
    "Which statement best describes the relationship between... and...?",
    "In practical applications, how does... typically affect...?",
  ];

  const prompt = `You are an expert quiz creator generating diverse, creative multiple-choice questions that avoid repetition and boredom.

Topic: ${categoryLabel}
Language: ${language}
Count: ${num}
Seed: ${seed ?? "none"}

CREATIVITY REQUIREMENTS:
- Use varied contexts: ${creativeContexts.slice(0, 5).join(", ")}
- Apply different question formats: ${questionFormats.slice(0, 5).join("; ")}
- Include real-world scenarios, case studies, comparisons, problem-solving situations
- Vary difficulty levels and approaches to the same concept
- Create questions that test understanding from different angles

CONTENT RULES:
- Each question must have a unique context or scenario, even if testing the same core concept
- Use diverse question stems: scenario-based, analytical, comparative, application-focused
- Make each question intellectually engaging and thought-provoking
- Avoid generic "What is..." questions - instead use "How does...", "Why would...", "Which approach...", "In what scenario..."
- Create plausible distractors that test common misconceptions
- Ensure questions require actual understanding, not just memorization

OUTPUT FORMAT:
- Exactly ${num} items as JSON
- Each item: prompt (2-3 sentences with context), difficulty (1-3), language, category, choices (exactly 4 options with id: "a"/"b"/"c"/"d" and concise text), correctChoiceId
- Make prompts contextual and scenario-based
- Ensure all choices are plausible and test different aspects of knowledge
- Use natural, professional language appropriate for the topic

EXAMPLES OF CREATIVE APPROACHES:
- Instead of "What is photosynthesis?" → "Sarah, a marine biologist, was exploring a coral reef when she noticed that the coral polyps seemed more active during daylight hours. She observed tiny algae living symbiotically within the coral tissues, producing oxygen bubbles that rose to the surface. What biological process were these algae performing that benefits both the algae and the coral?"
- Instead of "What is democracy?" → "The small island nation of Pacifica recently gained independence and its 50,000 citizens are debating how to structure their new government. The elder council suggests that every major decision should be made by having all citizens vote directly. However, some worry this might be impractical for complex issues. What type of political system would best balance citizen participation with effective governance?"
- Instead of "What is gravity?" → "Commander Lopez was conducting experiments aboard the International Space Station when she accidentally dropped her pen and a metal wrench at the same time. Her colleague on Earth asked her what she observed. What would accurately describe what happened to both objects in the microgravity environment?"

Generate questions that make learners think critically and apply knowledge in realistic contexts.`;

  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    schema: GeneratedMcqQuestionsSchema,
    prompt,
    temperature: 0.7, // Increased temperature for more creativity
  });

  const items = (result.object || []).map((q) => ({
    ...q,
    language,
    category: categoryLabel,
  }));

  // Server-side validation: ensure unique choices and correct in set
  const validated = items.slice(0, num).map((q) => {
    const seen = new Set<string>();
    const dedupChoices = q.choices.filter((c) => {
      const key = `${c.id}::${c.text.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const hasCorrect = dedupChoices.some((c) => c.id === q.correctChoiceId);
    return {
      ...q,
      choices: dedupChoices.slice(0, 4),
      correctChoiceId:
        hasCorrect && dedupChoices.length >= 3
          ? q.correctChoiceId
          : dedupChoices[0]?.id || q.correctChoiceId,
    } satisfies GeneratedMcqQuestion;
  });

  return validated;
}
