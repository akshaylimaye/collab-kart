package com.collabkart.service;

import com.collabkart.dto.CampaignApplicationResponse;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.dto.CreatorProfileResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignApplication;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.BrandProfileRepository;
import com.collabkart.repository.CampaignApplicationRepository;
import com.collabkart.repository.CampaignRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandApplicationService {

    private final BrandProfileRepository brandProfileRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignApplicationRepository campaignApplicationRepository;

    @Transactional(readOnly = true)
    public List<CampaignApplicationResponse> getCampaignApplications(User user, UUID campaignId) {
        BrandProfile brandProfile = getBrandProfile(user);
        Campaign campaign = campaignRepository.findByIdAndBrandProfileId(campaignId, brandProfile.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));

        return campaignApplicationRepository.findByCampaignId(campaign.getId())
                .stream()
                .map(this::toApplicationResponse)
                .toList();
    }

    @Transactional
    public CampaignApplicationResponse acceptApplication(User user, UUID applicationId) {
        CampaignApplication application = getOwnedApplication(user, applicationId);
        ensureApplicationCanChange(application);
        application.setStatus(ApplicationStatus.ACCEPTED);
        return toApplicationResponse(application);
    }

    @Transactional
    public CampaignApplicationResponse rejectApplication(User user, UUID applicationId) {
        CampaignApplication application = getOwnedApplication(user, applicationId);
        ensureApplicationCanChange(application);
        application.setStatus(ApplicationStatus.REJECTED);
        return toApplicationResponse(application);
    }

    private CampaignApplication getOwnedApplication(User user, UUID applicationId) {
        BrandProfile brandProfile = getBrandProfile(user);
        CampaignApplication application = campaignApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getCampaign().getBrandProfile().getId().equals(brandProfile.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Application not found");
        }

        return application;
    }

    private void ensureApplicationCanChange(CampaignApplication application) {
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new ApiException(HttpStatus.CONFLICT, "Application has already been finalized");
        }
    }

    private BrandProfile getBrandProfile(User user) {
        return brandProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Brand profile not found"));
    }

    private CampaignApplicationResponse toApplicationResponse(CampaignApplication application) {
        return new CampaignApplicationResponse(
                application.getId(),
                application.getCampaign().getId(),
                application.getCreatorProfile().getId(),
                toCreatorProfileResponse(application.getCreatorProfile()),
                application.getStatus(),
                application.getMessage(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                toCampaignResponse(application.getCampaign())
        );
    }

    private CreatorProfileResponse toCreatorProfileResponse(CreatorProfile profile) {
        return new CreatorProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getInstagramHandle(),
                profile.getFollowerCount(),
                profile.getCategory(),
                profile.getBio(),
                profile.getCity()
        );
    }

    private CampaignResponse toCampaignResponse(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getBrandProfile().getId(),
                campaign.getTitle(),
                campaign.getProductName(),
                campaign.getDescription(),
                campaign.getCategory(),
                campaign.getProductImageUrl(),
                campaign.getCommissionType(),
                campaign.getCommissionValue(),
                campaign.getStatus(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt()
        );
    }
}
