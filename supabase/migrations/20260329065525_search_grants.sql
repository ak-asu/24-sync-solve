
GRANT SELECT ON public.coach_search_documents TO anon, authenticated;

CREATE OR REPLACE FUNCTION match_coach_documents(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  coach_id uuid,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    csd.coach_id,
    1 - (csd.embedding <=> query_embedding) AS similarity
  FROM public.coach_search_documents AS csd
  WHERE 1 - (csd.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

