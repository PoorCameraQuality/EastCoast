ALTER TABLE dancecard_iso_posts
  ADD COLUMN IF NOT EXISTS contact_link text;

CREATE TABLE IF NOT EXISTS dancecard_iso_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_post_id uuid NOT NULL REFERENCES dancecard_iso_posts(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES dancecard_iso_comments(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 2000),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_iso_comments_post
  ON dancecard_iso_comments (iso_post_id, created_at);

CREATE INDEX IF NOT EXISTS idx_dancecard_iso_comments_parent
  ON dancecard_iso_comments (parent_comment_id);
