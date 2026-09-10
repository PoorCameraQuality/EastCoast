ALTER TABLE public.events ADD COLUMN IF NOT EXISTS staff_applications_open boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS vendor_applications_open boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS presenter_applications_open boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photographer_applications_open boolean NOT NULL DEFAULT false;

UPDATE public.events SET staff_applications_open = true WHERE coalesce(staff_application_url, '') <> '';
UPDATE public.events SET vendor_applications_open = true WHERE coalesce(vendor_application_url, '') <> '';
UPDATE public.events SET presenter_applications_open = true WHERE coalesce(presenter_application_url, '') <> '';
UPDATE public.events SET photographer_applications_open = true WHERE coalesce(photographer_application_url, '') <> '';
