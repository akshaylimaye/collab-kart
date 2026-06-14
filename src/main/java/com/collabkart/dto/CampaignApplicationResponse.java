package com.collabkart.dto;

import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CommissionType;
import com.collabkart.entity.CouponStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CampaignApplicationResponse(
        UUID applicationId,
        UUID campaignId,
        String campaignTitle,
        String campaignProductImageUrl,
        String brandName,
        String campaignCategory,
        CampaignStatus campaignStatus,
        CommissionType campaignCommissionType,
        BigDecimal campaignCommissionValue,
        String message,
        ApplicationStatus status,
        String rejectionReason,
        String couponCode,
        CouponStatus couponStatus,
        String brandInstructions,
        Instant acceptedAt,
        Instant rejectedAt,
        Instant couponAssignedAt,
        Instant couponDisabledAt,
        Instant appliedAt,
        Instant updatedAt
) {
}
