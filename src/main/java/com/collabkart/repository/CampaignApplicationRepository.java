package com.collabkart.repository;

import com.collabkart.entity.CampaignApplication;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignApplicationRepository extends JpaRepository<CampaignApplication, UUID> {

    List<CampaignApplication> findByCampaignId(UUID campaignId);

    List<CampaignApplication> findByCreatorProfileId(UUID creatorProfileId);

    Optional<CampaignApplication> findByCampaignIdAndCreatorProfileId(UUID campaignId, UUID creatorProfileId);
}
