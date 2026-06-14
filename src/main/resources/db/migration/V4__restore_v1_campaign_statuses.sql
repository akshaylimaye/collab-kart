UPDATE campaigns
SET status = 'DRAFT'
WHERE status = 'PENDING_REVIEW';

UPDATE campaigns
SET status = 'ARCHIVED'
WHERE status = 'REJECTED';

ALTER TABLE campaigns
    DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns
    ADD CONSTRAINT campaigns_status_check
    CHECK (status IN ('DRAFT', 'LIVE', 'ARCHIVED'));
