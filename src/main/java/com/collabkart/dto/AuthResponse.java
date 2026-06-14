package com.collabkart.dto;

import com.collabkart.entity.Role;
import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String name,
        String email,
        Role role
) {
}
