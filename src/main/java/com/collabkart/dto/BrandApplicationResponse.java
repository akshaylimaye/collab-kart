package com.collabkart.dto;

import com.collabkart.entity.ApplicationStatus;
import java.time.Instant;
import java.util.UUID;

public record BrandApplicationResponse(
        UUID applicationId,
        UUID campaignId,
        String campaignTitle,
        UUID creatorId,
        String creatorName,
        String creatorInstagramHandle,
        Integer creatorFollowerCount,
        String creatorCategory,
        String message,
        ApplicationStatus status,
        Instant appliedAt,
        Instant updatedAt
) {
}
