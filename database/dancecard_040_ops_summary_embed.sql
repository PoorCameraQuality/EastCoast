-- Add ops_summary embed kind (separate token from schedule/map for C2K ops iframe).

ALTER TABLE dancecard_embed_tokens
  DROP CONSTRAINT IF EXISTS dancecard_embed_tokens_embed_kind_check;

ALTER TABLE dancecard_embed_tokens
  ADD CONSTRAINT dancecard_embed_tokens_embed_kind_check
  CHECK (embed_kind IN ('schedule', 'map', 'ops_summary'));

COMMENT ON COLUMN dancecard_embed_tokens.embed_kind IS 'schedule | map | ops_summary — ops_summary exposes readiness metrics only; mint a dedicated token.';
