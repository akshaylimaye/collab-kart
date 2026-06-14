package com.collabkart.dto;

import java.util.UUID;

public record CreatorProfileResponse(
        UUID id,
        UUID userId,
        String instagramHandle,
        Integer followerCount,
        String category,
        String bio,
        String city
) {
}
