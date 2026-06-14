package com.collabkart.dto;

import com.collabkart.entity.ApplicationStatus;
import java.time.Instant;
import java.util.UUID;

public record CampaignApplicationResponse(
        UUID id,
        UUID campaignId,
        UUID creatorProfileId,
        ApplicationStatus status,
        String message,
        Instant createdAt,
        Instant updatedAt,
        CampaignResponse campaign
) {
}
