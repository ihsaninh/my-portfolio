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
