package com.collabkart.dto;

import java.util.UUID;

public record BrandProfileResponse(
        UUID id,
        UUID userId,
        String brandName,
        String website,
        String instagramHandle,
        String category,
        String description
) {
}
