package com.collabkart.service;

import com.collabkart.dto.CampaignMultipartRequest;
import com.collabkart.dto.CampaignRequest;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CouponStatus;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.BrandProfileRepository;
import com.collabkart.repository.CampaignRepository;
import java.time.Instant;
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
    private final ImageStorageService imageStorageService;

    @Transactional
    public CampaignResponse createCampaign(User user, CampaignRequest request) {
        BrandProfile brandProfile = getBrandProfile(user);

        Campaign campaign = Campaign.builder()
                .brandProfile(brandProfile)
                .title(request.title().trim())
                .productName(request.productName().trim())
                .description(request.description().trim())
                .category(request.category().trim())
                .productImageUrl(null)
                .commissionType(request.commissionType())
                .commissionValue(request.commissionValue())
                .status(CampaignStatus.DRAFT)
                .build();

        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public CampaignResponse createCampaign(User user, CampaignMultipartRequest request) {
        BrandProfile brandProfile = getBrandProfile(user);
        String imageUrl = imageStorageService.hasImage(request.getProductImage())
                ? imageStorageService.uploadCampaignImage(request.getProductImage())
                : null;

        Campaign campaign = Campaign.builder()
                .brandProfile(brandProfile)
                .title(request.getTitle().trim())
                .productName(request.getProductName().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .productImageUrl(imageUrl)
                .commissionType(request.getCommissionType())
                .commissionValue(request.getCommissionValue())
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

        updateCampaignFields(
                campaign,
                request.title(),
                request.productName(),
                request.description(),
                request.category(),
                request.commissionType(),
                request.commissionValue()
        );

        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse updateCampaign(User user, UUID campaignId, CampaignMultipartRequest request) {
        Campaign campaign = getOwnedCampaign(user, campaignId);

        updateCampaignFields(
                campaign,
                request.getTitle(),
                request.getProductName(),
                request.getDescription(),
                request.getCategory(),
                request.getCommissionType(),
                request.getCommissionValue()
        );

        if (imageStorageService.hasImage(request.getProductImage())) {
            campaign.setProductImageUrl(imageStorageService.uploadCampaignImage(request.getProductImage()));
        }

        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse publishCampaign(UUID campaignId, UUID brandUserId) {
        Campaign campaign = getOwnedCampaign(brandUserId, campaignId);
        ensureCanMakeLive(campaign);
        ensureCampaignReadyForLive(campaign);
        // TODO: In future, this method may route campaigns to PENDING_REVIEW if admin approval is enabled.
        reactivateAcceptedCoupons(campaign);
        campaign.setStatus(CampaignStatus.LIVE);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse archiveCampaign(User user, UUID campaignId) {
        Campaign campaign = getOwnedCampaign(user, campaignId);
        ensureCanArchive(campaign);
        deactivateAcceptedCoupons(campaign);
        campaign.setStatus(CampaignStatus.ARCHIVED);
        return toResponse(campaign);
    }

    private void updateCampaignFields(
            Campaign campaign,
            String title,
            String productName,
            String description,
            String category,
            com.collabkart.entity.CommissionType commissionType,
            java.math.BigDecimal commissionValue
    ) {
        campaign.setTitle(title.trim());
        campaign.setProductName(productName.trim());
        campaign.setDescription(description.trim());
        campaign.setCategory(category.trim());
        campaign.setCommissionType(commissionType);
        campaign.setCommissionValue(commissionValue);
    }

    private void ensureCanMakeLive(Campaign campaign) {
        if (campaign.getStatus() != CampaignStatus.DRAFT && campaign.getStatus() != CampaignStatus.ARCHIVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Only draft or archived campaigns can be made live.");
        }
    }

    private void ensureCanArchive(Campaign campaign) {
        if (campaign.getStatus() != CampaignStatus.DRAFT && campaign.getStatus() != CampaignStatus.LIVE) {
            throw new ApiException(HttpStatus.CONFLICT, "Only draft or live campaigns can be archived.");
        }
    }

    private void ensureCampaignReadyForLive(Campaign campaign) {
        if (isBlank(campaign.getTitle()) || isBlank(campaign.getProductName()) || isBlank(campaign.getDescription()) || isBlank(campaign.getCategory())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Campaign title, product name, category, and description are required before making campaign live.");
        }
        if (campaign.getCommissionType() == null || campaign.getCommissionValue() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Campaign commission details are required before making campaign live.");
        }
        if (isBlank(campaign.getProductImageUrl())) {
            throw new ApiException(HttpStatus.CONFLICT, "Product image is required before publishing campaign");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private void deactivateAcceptedCoupons(Campaign campaign) {
        Instant now = Instant.now();
        campaign.getApplications().stream()
                .filter(application -> application.getStatus() == ApplicationStatus.ACCEPTED)
                .filter(application -> application.getCouponStatus() == CouponStatus.ACTIVE)
                .forEach(application -> {
                    application.setCouponStatus(CouponStatus.INACTIVE);
                    application.setCouponDisabledAt(now);
                });
    }

    private void reactivateAcceptedCoupons(Campaign campaign) {
        campaign.getApplications().stream()
                .filter(application -> application.getStatus() == ApplicationStatus.ACCEPTED)
                .filter(application -> application.getCouponCode() != null && !application.getCouponCode().isBlank())
                .forEach(application -> {
                    application.setCouponStatus(CouponStatus.ACTIVE);
                    application.setCouponDisabledAt(null);
                });
    }

    private Campaign getOwnedCampaign(User user, UUID campaignId) {
        return getOwnedCampaign(user.getId(), campaignId);
    }

    private Campaign getOwnedCampaign(UUID brandUserId, UUID campaignId) {
        BrandProfile brandProfile = getBrandProfile(brandUserId);
        return campaignRepository.findByIdAndBrandProfileId(campaignId, brandProfile.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));
    }

    private BrandProfile getBrandProfile(User user) {
        return getBrandProfile(user.getId());
    }

    private BrandProfile getBrandProfile(UUID brandUserId) {
        return brandProfileRepository.findByUserId(brandUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Brand profile not found"));
    }

    private CampaignResponse toResponse(Campaign campaign) {
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
