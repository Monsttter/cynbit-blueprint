ALTER TABLE project_submissions
  DROP CONSTRAINT IF EXISTS project_submissions_generation_source_check;

ALTER TABLE project_submissions
  ADD CONSTRAINT project_submissions_generation_source_check
  CHECK (generation_source IN ('rules', 'gemini'));
