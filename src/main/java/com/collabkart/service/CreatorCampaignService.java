package com.collabkart.service;

import com.collabkart.dto.CampaignApplicationRequest;
import com.collabkart.dto.CampaignApplicationResponse;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignApplication;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.CampaignApplicationRepository;
import com.collabkart.repository.CampaignRepository;
import com.collabkart.repository.CreatorProfileRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreatorCampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignApplicationRepository campaignApplicationRepository;
    private final CreatorProfileRepository creatorProfileRepository;

    @Transactional(readOnly = true)
    public List<CampaignResponse> getLiveCampaigns() {
        return campaignRepository.findByStatus(CampaignStatus.LIVE)
                .stream()
                .map(this::toCampaignResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getLiveCampaign(UUID campaignId) {
        Campaign campaign = getLiveCampaignById(campaignId);
        return toCampaignResponse(campaign);
    }

    @Transactional
    public CampaignApplicationResponse apply(User user, UUID campaignId, CampaignApplicationRequest request) {
        CreatorProfile creatorProfile = getCreatorProfile(user);
        Campaign campaign = getLiveCampaignById(campaignId);

        if (campaignApplicationRepository.findByCampaignIdAndCreatorProfileId(campaign.getId(), creatorProfile.getId()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already applied to this campaign");
        }

        CampaignApplication application = CampaignApplication.builder()
                .campaign(campaign)
                .creatorProfile(creatorProfile)
                .status(ApplicationStatus.APPLIED)
                .message(normalizeMessage(request))
                .build();

        return toApplicationResponse(campaignApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<CampaignApplicationResponse> getApplications(User user) {
        CreatorProfile creatorProfile = getCreatorProfile(user);
        return campaignApplicationRepository.findByCreatorProfileIdOrderByCreatedAtDesc(creatorProfile.getId())
                .stream()
                .map(this::toApplicationResponse)
                .toList();
    }

    @Transactional
    public CampaignApplicationResponse updateApplicationMessage(User user, UUID applicationId, CampaignApplicationRequest request) {
        CampaignApplication application = getOwnedApplication(user, applicationId);
        ensureApplicationCanBeEdited(application);
        application.setMessage(normalizeMessage(request));
        application.setUpdatedAt(Instant.now());
        return toApplicationResponse(application);
    }

    @Transactional
    public CampaignApplicationResponse withdrawApplication(User user, UUID applicationId) {
        CampaignApplication application = getOwnedApplication(user, applicationId);
        ensureApplicationCanBeWithdrawn(application);
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setUpdatedAt(Instant.now());
        return toApplicationResponse(application);
    }

    private Campaign getLiveCampaignById(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));

        if (campaign.getStatus() != CampaignStatus.LIVE) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Campaign not found");
        }

        return campaign;
    }

    private CreatorProfile getCreatorProfile(User user) {
        return creatorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    private CampaignApplication getOwnedApplication(User user, UUID applicationId) {
        CampaignApplication application = campaignApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getCreatorProfile().getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to manage this application");
        }

        return application;
    }

    private void ensureApplicationCanBeEdited(CampaignApplication application) {
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only applied applications can be edited.");
        }
    }

    private void ensureApplicationCanBeWithdrawn(CampaignApplication application) {
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only applied applications can be withdrawn.");
        }
    }

    private String normalizeMessage(CampaignApplicationRequest request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            return null;
        }
        return request.message().trim();
    }

    private CampaignApplicationResponse toApplicationResponse(CampaignApplication application) {
        Campaign campaign = application.getCampaign();
        return new CampaignApplicationResponse(
                application.getId(),
                campaign.getId(),
                campaign.getTitle(),
                campaign.getProductImageUrl(),
                campaign.getBrandProfile().getBrandName(),
                campaign.getCategory(),
                campaign.getStatus(),
                campaign.getCommissionType(),
                campaign.getCommissionValue(),
                application.getMessage(),
                application.getStatus(),
                application.getRejectionReason(),
                application.getCouponCode(),
                application.getCouponStatus(),
                application.getBrandInstructions(),
                application.getAcceptedAt(),
                application.getRejectedAt(),
                application.getCouponAssignedAt(),
                application.getCouponDisabledAt(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    private CampaignResponse toCampaignResponse(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getBrandProfile().getId(),
                campaign.getBrandProfile().getBrandName(),
                campaign.getBrandProfile().getInstagramHandle(),
                campaign.getBrandProfile().getWebsite(),
                campaign.getBrandProfile().getCategory(),
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
