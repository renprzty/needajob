-- Run in Supabase SQL Editor before using PDF text extraction.
BEGIN;
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS extracted_text text,
  ADD COLUMN IF NOT EXISTS text_extracted_at timestamptz;
COMMENT ON COLUMN public.documents.extracted_text IS
  'Cached PDF text for deterministic matching. The original PDF remains the source of truth.';
COMMIT;
