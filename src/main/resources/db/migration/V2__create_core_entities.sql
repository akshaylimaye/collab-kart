ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    instagram_handle VARCHAR(100),
    follower_count INTEGER,
    category VARCHAR(120),
    bio TEXT,
    city VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    brand_name VARCHAR(160) NOT NULL,
    website VARCHAR(255),
    instagram_handle VARCHAR(100),
    category VARCHAR(120),
    description TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY,
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    product_name VARCHAR(180) NOT NULL,
    description TEXT,
    category VARCHAR(120),
    product_image_url VARCHAR(500),
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('FIXED', 'PERCENTAGE')),
    commission_value NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'LIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_applications (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    creator_profile_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'ACCEPTED', 'REJECTED')),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_campaign_applications_campaign_creator UNIQUE (campaign_id, creator_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_profile_id ON campaigns (brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator_profile_id ON campaign_applications (creator_profile_id);
