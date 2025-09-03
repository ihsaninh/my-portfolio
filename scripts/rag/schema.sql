-- Enable pgvector
create extension if not exists pgcrypto;
create extension if not exists vector;

-- RAG chunks table (Google text-embedding-004 => 768 dims)
create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id text,
  source text, -- e.g., 'blog', 'readme', 'portfolio'
  url text,
  title text,
  chunk_index int,
  content text not null,
  embedding vector(768) not null,
  metadata jsonb,
  updated_at timestamptz default now()
);

-- Vector index for cosine distance
create index if not exists rag_chunks_embedding_idx on public.rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists rag_chunks_doc_idx on public.rag_chunks (doc_id);

-- Similarity search function
create or replace function public.match_rag_chunks(
  query_embedding vector(768),
  match_count int,
  match_threshold float
)
returns table (
  id uuid,
  doc_id text,
  source text,
  url text,
  title text,
  content text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    rc.id,
    rc.doc_id,
    rc.source,
    rc.url,
    rc.title,
    rc.content,
    rc.chunk_index,
    rc.metadata,
    1 - (rc.embedding <=> query_embedding) as similarity
  from public.rag_chunks rc
  where 1 - (rc.embedding <=> query_embedding) >= match_threshold
  order by rc.embedding <=> query_embedding
  limit match_count;
end;
$$;
