import { supabaseServer } from "@/src/shared/lib/services/supabase";

import { embedOne } from "./embeddings";

export type RetrievedChunk = {
  id: string;
  doc_id: string | null;
  source: string | null;
  url: string | null;
  title: string | null;
  content: string;
  chunk_index: number | null;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

export async function retrieveSimilar(
  query: string,
  {
    matchCount = 6,
    threshold = 0.5,
    allowedSources,
  }: { matchCount?: number; threshold?: number; allowedSources?: string[] } = {}
): Promise<RetrievedChunk[]> {
  const sb = supabaseServer();
  const queryEmbedding = await embedOne(query);

  const { data, error } = await sb.rpc("match_rag_chunks", {
    query_embedding: queryEmbedding as unknown as number[],
    match_count: matchCount,
    match_threshold: threshold,
  });

  if (error) throw error;
  let rows = (data ?? []) as RetrievedChunk[];

  // Filter by allowed sources if specified
  if (allowedSources && allowedSources.length) {
    const sourceSet = new Set(allowedSources.map((s) => s.toLowerCase()));
    rows = rows.filter((r) => {
      const source = (r.source ?? "").toLowerCase();
      return source && sourceSet.has(source);
    });
  }

  return rows;
}
