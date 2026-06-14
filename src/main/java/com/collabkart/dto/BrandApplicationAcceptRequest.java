package com.collabkart.dto;

import jakarta.validation.constraints.Size;

public record BrandApplicationAcceptRequest(
        String couponCode,
        @Size(max = 1000, message = "Brand instructions must be 1000 characters or fewer") String brandInstructions
) {
}
