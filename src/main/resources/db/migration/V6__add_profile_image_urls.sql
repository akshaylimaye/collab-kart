ALTER TABLE creator_profiles
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);

ALTER TABLE brand_profiles
    ADD COLUMN IF NOT EXISTS logo_image_url VARCHAR(500);
