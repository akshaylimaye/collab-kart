ALTER TABLE campaign_applications
    DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE campaign_applications
    ADD CONSTRAINT campaign_applications_status_check
    CHECK (status IN ('APPLIED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));
