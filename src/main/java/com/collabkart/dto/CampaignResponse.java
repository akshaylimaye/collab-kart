package com.collabkart.dto;

import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CommissionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CampaignResponse(
        UUID id,
        UUID brandProfileId,
        String brandName,
        String brandInstagramHandle,
        String brandWebsite,
        String brandCategory,
        String title,
        String productName,
        String description,
        String category,
        String productImageUrl,
        CommissionType commissionType,
        BigDecimal commissionValue,
        CampaignStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
