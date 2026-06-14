package com.collabkart.dto;

import jakarta.validation.constraints.Size;

public record CampaignApplicationRequest(
        @Size(max = 500, message = "Message must be 500 characters or fewer") String message
) {
}
