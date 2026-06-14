package com.collabkart.repository;

import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    List<Campaign> findByBrandProfileId(UUID brandProfileId);

    Optional<Campaign> findByIdAndBrandProfileId(UUID id, UUID brandProfileId);

    boolean existsByBrandProfileIdAndTitleAndProductName(UUID brandProfileId, String title, String productName);

    List<Campaign> findByStatus(CampaignStatus status);
}
