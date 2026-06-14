package com.collabkart.repository;

import com.collabkart.entity.CreatorProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, UUID> {

    Optional<CreatorProfile> findByUserId(UUID userId);
}
