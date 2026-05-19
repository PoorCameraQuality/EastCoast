-- Category-scoped required questions. Apply after dancecard_012_registration.sql.

ALTER TABLE dancecard_registration_questions
  ADD COLUMN IF NOT EXISTS required_for_category_ids uuid[] NOT NULL DEFAULT '{}';
