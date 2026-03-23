-- Consolidate three URL columns into one, preferring application_url > url > source_url
UPDATE app.role
SET url = COALESCE(application_url, url, source_url)
WHERE application_url IS NOT NULL OR source_url IS NOT NULL;

ALTER TABLE app.role DROP COLUMN source_url;
ALTER TABLE app.role DROP COLUMN application_url;
