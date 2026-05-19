-- Compare request intent, attendee directory opt-in, attending badge

ALTER TABLE dancecard_compare_requests
  ADD COLUMN IF NOT EXISTS intent text NOT NULL DEFAULT 'schedule'
    CHECK (intent IN ('practice', 'social', 'schedule'));

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS show_in_attendee_directory boolean NOT NULL DEFAULT false;

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS show_attending_status boolean NOT NULL DEFAULT false;

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS favorited_slot_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN dancecard_prefs.favorited_slot_ids IS 'Program slot UUIDs starred for itinerary (not dancecard selections).';
