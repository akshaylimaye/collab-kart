package com.collabkart.dto;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreatorProfileRequest(
        @Size(max = 100, message = "Instagram handle must be 100 characters or fewer") String instagramHandle,
        @PositiveOrZero(message = "Follower count cannot be negative") Integer followerCount,
        @Size(max = 120, message = "Category must be 120 characters or fewer") String category,
        String bio,
        @Size(max = 120, message = "City must be 120 characters or fewer") String city
) {
}
