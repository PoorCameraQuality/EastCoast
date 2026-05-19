-- Door check-in signed tokens (QR on badges). Apply after dancecard_036_registrant_checkin.sql.

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS check_in_token text;

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_registrants_event_check_in_token_uidx
  ON dancecard_registrants (event_id, check_in_token)
  WHERE check_in_token IS NOT NULL;
