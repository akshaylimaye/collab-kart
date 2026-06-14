package com.collabkart.repository;

import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    List<Campaign> findByBrandProfileId(UUID brandProfileId);

    List<Campaign> findByStatus(CampaignStatus status);
}
