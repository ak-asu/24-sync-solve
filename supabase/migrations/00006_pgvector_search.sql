-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Create a table to store coach profile embeddings
create table if not exists public.coach_search_documents (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null unique references public.coach_profiles(id) on delete cascade,
  content text,
  embedding vector(384), -- Dimensions for intfloat/multilingual-e5-small
  created_at timestamptz default now()
);

-- Create an index for faster similarity search
create index on public.coach_search_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Create a function to perform semantic search
create or replace function match_coach_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  coach_id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    csd.coach_id,
    1 - (csd.embedding <=> query_embedding) as similarity
  from public.coach_search_documents as csd
  where 1 - (csd.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
