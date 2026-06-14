package com.collabkart.repository;

import com.collabkart.entity.CampaignApplication;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CampaignApplicationRepository extends JpaRepository<CampaignApplication, UUID> {

    List<CampaignApplication> findByCampaignId(UUID campaignId);

    List<CampaignApplication> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId);

    List<CampaignApplication> findByCreatorProfileId(UUID creatorProfileId);

    List<CampaignApplication> findByCreatorProfileIdOrderByCreatedAtDesc(UUID creatorProfileId);

    Optional<CampaignApplication> findByCampaignIdAndCreatorProfileId(UUID campaignId, UUID creatorProfileId);

    @Query("""
            select count(application) > 0
            from CampaignApplication application
            where application.couponCode = :couponCode
              and application.campaign.brandProfile.id = :brandProfileId
              and (:excludeApplicationId is null or application.id <> :excludeApplicationId)
            """)
    boolean existsCouponCodeForBrand(
            @Param("brandProfileId") UUID brandProfileId,
            @Param("couponCode") String couponCode,
            @Param("excludeApplicationId") UUID excludeApplicationId
    );
}

