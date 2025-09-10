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
export const McqChoiceSchema = z.object({ id: z.string().min(1), text: z.string().min(1).max(120) });
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

  const prompt = `You are generating multiple-choice quiz questions.

Category: ${categoryLabel}
Language: ${language}
Count: ${num}
Seed: ${seed ?? "none"}

Rules:
- Output exactly ${num} items as JSON.
- Each item must have: prompt (1–2 sentences), integer difficulty 1..3, language, category, choices (exactly 4 unique concise options with id and text), and correctChoiceId.
- Use natural, unambiguous wording; no code execution required.
- Ensure exactly one correctChoiceId matches one of the provided choices.
- Use the specified language for prompt and choices.
`;

  const result = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    schema: GeneratedMcqQuestionsSchema,
    prompt,
    temperature: 0.4,
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
      correctChoiceId: hasCorrect && dedupChoices.length >= 3 ? q.correctChoiceId : (dedupChoices[0]?.id || q.correctChoiceId),
    } satisfies GeneratedMcqQuestion;
  });

  return validated;
}
