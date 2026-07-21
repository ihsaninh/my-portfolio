import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const embeddingModel = google.textEmbedding("gemini-embedding-001");

const providerOptions = {
  google: { outputDimensionality: 768 },
};

export async function embedOne(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions,
  });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
    providerOptions,
  });
  return embeddings;
}
