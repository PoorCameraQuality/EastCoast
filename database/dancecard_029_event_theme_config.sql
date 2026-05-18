-- Dancecard 029: per-event theme_config for accent/surface CSS variables (UI Phase 4).
ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS theme_config jsonb NOT NULL DEFAULT '{}';
