package com.collabkart.dto;

import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.CommissionType;
import com.collabkart.entity.CouponStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BrandApplicationResponse(
        UUID applicationId,
        UUID campaignId,
        String campaignTitle,
        CommissionType campaignCommissionType,
        BigDecimal campaignCommissionValue,
        UUID creatorId,
        String creatorName,
        String creatorInstagramHandle,
        Integer creatorFollowerCount,
        String creatorCategory,
        String creatorCity,
        String creatorBio,
        String creatorProfileImageUrl,
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
