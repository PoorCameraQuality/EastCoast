-- Dancecard 031: agreements config + acceptance audit fields + RabbitSign registrant status.

ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS agreements_config jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_registrant_policy_acceptances
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_email text,
  ADD COLUMN IF NOT EXISTS signature_method text,
  ADD COLUMN IF NOT EXISTS provider_ref text,
  ADD COLUMN IF NOT EXISTS ip_hash text;

ALTER TABLE dancecard_registrant_policy_acceptances
  DROP CONSTRAINT IF EXISTS dancecard_reg_pol_accept_signature_method_check;

ALTER TABLE dancecard_registrant_policy_acceptances
  ADD CONSTRAINT dancecard_reg_pol_accept_signature_method_check
  CHECK (signature_method IS NULL OR signature_method IN ('ecke', 'rabbitsign', 'manual'));

ALTER TABLE dancecard_registrants
  ADD COLUMN IF NOT EXISTS rabbitsign_folder_id text,
  ADD COLUMN IF NOT EXISTS rabbitsign_status text;

ALTER TABLE dancecard_registrants
  DROP CONSTRAINT IF EXISTS dancecard_registrants_rabbitsign_status_check;

ALTER TABLE dancecard_registrants
  ADD CONSTRAINT dancecard_registrants_rabbitsign_status_check
  CHECK (rabbitsign_status IS NULL OR rabbitsign_status IN ('pending', 'signed', 'declined'));

COMMENT ON COLUMN dancecard_events.agreements_config IS 'mode: ecke|rabbitsign|hybrid, requiredPolicyKinds[], deadlineAt, rabbitsignApiKeyRef.';
