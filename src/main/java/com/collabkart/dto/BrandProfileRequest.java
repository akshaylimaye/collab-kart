package com.collabkart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BrandProfileRequest(
        @NotBlank(message = "Brand name is required") @Size(max = 160, message = "Brand name must be 160 characters or fewer") String brandName,
        @Size(max = 255, message = "Website must be 255 characters or fewer") String website,
        @Size(max = 100, message = "Instagram handle must be 100 characters or fewer") String instagramHandle,
        @NotBlank(message = "Category is required")
        @Size(max = 120, message = "Category must be 120 characters or fewer") String category,
        String description
) {
}
