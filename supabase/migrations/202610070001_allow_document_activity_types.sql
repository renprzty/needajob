-- Run in the project's Supabase SQL Editor.
-- Preserve existing activity types and allow the document events used by the UI.
BEGIN;

DO $migration$
DECLARE
  existing_expression text;
BEGIN
  SELECT pg_get_expr(conbin, conrelid)
    INTO existing_expression
    FROM pg_constraint
   WHERE conrelid = 'public.application_activities'::regclass
     AND conname = 'application_activities_type_check'
     AND contype = 'c';

  IF existing_expression IS NULL THEN
    RAISE EXCEPTION 'Expected application_activities_type_check was not found; inspect the database schema before applying this migration.';
  END IF;

  -- Make reruns harmless.
  IF position('''document_attached''' IN existing_expression) > 0
     AND position('''document_unlinked''' IN existing_expression) > 0 THEN
    RETURN;
  END IF;

  ALTER TABLE public.application_activities
    DROP CONSTRAINT application_activities_type_check;

  EXECUTE format(
    'ALTER TABLE public.application_activities
       ADD CONSTRAINT application_activities_type_check
       CHECK ((%s) OR activity_type::text IN (%L, %L))',
    existing_expression,
    'document_attached',
    'document_unlinked'
  );
END
$migration$;

COMMIT;

-- Verify the constraint now accepts both document event types.
SELECT pg_get_constraintdef(oid) AS activity_type_constraint
FROM pg_constraint
WHERE conrelid = 'public.application_activities'::regclass
  AND conname = 'application_activities_type_check';
