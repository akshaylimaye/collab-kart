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
                .message(request == null ? null : request.message())
                .build();

        return toApplicationResponse(campaignApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<CampaignApplicationResponse> getApplications(User user) {
        CreatorProfile creatorProfile = getCreatorProfile(user);
        return campaignApplicationRepository.findByCreatorProfileId(creatorProfile.getId())
                .stream()
                .map(this::toApplicationResponse)
                .toList();
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

    private CampaignApplicationResponse toApplicationResponse(CampaignApplication application) {
        return new CampaignApplicationResponse(
                application.getId(),
                application.getCampaign().getId(),
                application.getCreatorProfile().getId(),
                application.getStatus(),
                application.getMessage(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                toCampaignResponse(application.getCampaign())
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
