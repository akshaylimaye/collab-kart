package com.collabkart.dto;

import jakarta.validation.constraints.Size;

public record BrandApplicationRejectRequest(
        @Size(max = 500, message = "Rejection reason must be 500 characters or fewer") String rejectionReason
) {
}
