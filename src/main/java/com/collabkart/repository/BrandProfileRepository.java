package com.collabkart.repository;

import com.collabkart.entity.BrandProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandProfileRepository extends JpaRepository<BrandProfile, UUID> {

    Optional<BrandProfile> findByUserId(UUID userId);
}
