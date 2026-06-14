ALTER TABLE campaign_applications
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(12),
    ADD COLUMN IF NOT EXISTS coupon_status VARCHAR(20),
    ADD COLUMN IF NOT EXISTS brand_instructions TEXT,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS coupon_assigned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS coupon_disabled_at TIMESTAMPTZ;

ALTER TABLE campaign_applications
    DROP CONSTRAINT IF EXISTS campaign_applications_coupon_status_check;

ALTER TABLE campaign_applications
    ADD CONSTRAINT campaign_applications_coupon_status_check
    CHECK (coupon_status IS NULL OR coupon_status IN ('ACTIVE', 'INACTIVE'));

CREATE INDEX IF NOT EXISTS idx_campaign_applications_coupon_code ON campaign_applications (coupon_code);
