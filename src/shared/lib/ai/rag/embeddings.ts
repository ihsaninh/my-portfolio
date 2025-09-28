import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

// Google text-embedding-004 returns 768-d vectors. Keep consistent with DB schema.

export async function embedOne(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: text,
  });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const { embeddings } = await embedMany({
    model: google.textEmbeddingModel("text-embedding-004"),
    values: texts,
  });
  return embeddings;
}
