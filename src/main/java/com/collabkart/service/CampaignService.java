package com.collabkart.service;

import com.collabkart.dto.CampaignRequest;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.BrandProfileRepository;
import com.collabkart.repository.CampaignRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final BrandProfileRepository brandProfileRepository;

    @Transactional
    public CampaignResponse createCampaign(User user, CampaignRequest request) {
        BrandProfile brandProfile = getBrandProfile(user);

        Campaign campaign = Campaign.builder()
                .brandProfile(brandProfile)
                .title(request.title().trim())
                .productName(request.productName().trim())
                .description(request.description().trim())
                .category(request.category().trim())
                .productImageUrl(request.productImageUrl())
                .commissionType(request.commissionType())
                .commissionValue(request.commissionValue())
                .status(CampaignStatus.DRAFT)
                .build();

        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getBrandCampaigns(User user) {
        BrandProfile brandProfile = getBrandProfile(user);
        return campaignRepository.findByBrandProfileId(brandProfile.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getBrandCampaign(User user, UUID campaignId) {
        Campaign campaign = getOwnedCampaign(user, campaignId);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse updateCampaign(User user, UUID campaignId, CampaignRequest request) {
        Campaign campaign = getOwnedCampaign(user, campaignId);

        campaign.setTitle(request.title().trim());
        campaign.setProductName(request.productName().trim());
        campaign.setDescription(request.description().trim());
        campaign.setCategory(request.category().trim());
        campaign.setProductImageUrl(request.productImageUrl());
        campaign.setCommissionType(request.commissionType());
        campaign.setCommissionValue(request.commissionValue());

        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse publishCampaign(User user, UUID campaignId) {
        Campaign campaign = getOwnedCampaign(user, campaignId);
        campaign.setStatus(CampaignStatus.LIVE);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse archiveCampaign(User user, UUID campaignId) {
        Campaign campaign = getOwnedCampaign(user, campaignId);
        campaign.setStatus(CampaignStatus.ARCHIVED);
        return toResponse(campaign);
    }

    private Campaign getOwnedCampaign(User user, UUID campaignId) {
        BrandProfile brandProfile = getBrandProfile(user);
        return campaignRepository.findByIdAndBrandProfileId(campaignId, brandProfile.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));
    }

    private BrandProfile getBrandProfile(User user) {
        return brandProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Brand profile not found"));
    }

    private CampaignResponse toResponse(Campaign campaign) {
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
