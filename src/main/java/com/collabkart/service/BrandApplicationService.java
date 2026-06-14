package com.collabkart.service;

import com.collabkart.dto.BrandApplicationAcceptRequest;
import com.collabkart.dto.BrandApplicationRejectRequest;
import com.collabkart.dto.BrandApplicationResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignApplication;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CouponStatus;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.CampaignApplicationRepository;
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
public class BrandApplicationService {

    private static final String COUPON_PATTERN = "^[A-Z0-9]{4,12}$";

    private final CampaignRepository campaignRepository;
    private final CampaignApplicationRepository campaignApplicationRepository;

    @Transactional(readOnly = true)
    public List<BrandApplicationResponse> getApplicationsForCampaign(UUID campaignId, UUID brandUserId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));
        ensureCampaignBelongsToBrand(campaign, brandUserId);

        return campaignApplicationRepository.findByCampaignIdOrderByCreatedAtDesc(campaign.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BrandApplicationResponse acceptApplication(UUID applicationId, UUID brandUserId, BrandApplicationAcceptRequest request) {
        CampaignApplication application = getApplication(applicationId);
        Campaign campaign = application.getCampaign();
        ensureCampaignBelongsToBrand(campaign, brandUserId);
        ensureApplicationCanChange(application);
        ensureCampaignCanBeReviewed(campaign);

        String couponCode = normalizeCouponCode(request == null ? null : request.couponCode());
        validateCouponCode(couponCode);
        if (campaignApplicationRepository.existsCouponCodeForBrand(campaign.getBrandProfile().getId(), couponCode, application.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Coupon code already exists for this brand. Please use a different code.");
        }

        Instant now = Instant.now();
        application.setStatus(ApplicationStatus.ACCEPTED);
        application.setCouponCode(couponCode);
        application.setCouponStatus(CouponStatus.ACTIVE);
        application.setBrandInstructions(normalizeOptional(request.brandInstructions()));
        application.setAcceptedAt(now);
        application.setCouponAssignedAt(now);
        application.setRejectedAt(null);
        application.setRejectionReason(null);
        application.setCouponDisabledAt(null);
        return toResponse(application);
    }

    @Transactional
    public BrandApplicationResponse rejectApplication(UUID applicationId, UUID brandUserId, BrandApplicationRejectRequest request) {
        CampaignApplication application = getApplication(applicationId);
        ensureCampaignBelongsToBrand(application.getCampaign(), brandUserId);
        ensureApplicationCanChange(application);
        ensureCampaignCanBeReviewed(application.getCampaign());
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectedAt(Instant.now());
        application.setRejectionReason(normalizeOptional(request == null ? null : request.rejectionReason()));
        return toResponse(application);
    }

    private CampaignApplication getApplication(UUID applicationId) {
        return campaignApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    private void ensureCampaignBelongsToBrand(Campaign campaign, UUID brandUserId) {
        if (!campaign.getBrandProfile().getUser().getId().equals(brandUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to manage this application");
        }
    }

    private void ensureApplicationCanChange(CampaignApplication application) {
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new ApiException(HttpStatus.CONFLICT, "Application has already been processed.");
        }
    }

    private void ensureCampaignCanBeReviewed(Campaign campaign) {
        if (campaign.getStatus() == CampaignStatus.ARCHIVED) {
            throw new ApiException(HttpStatus.CONFLICT, "Cannot review applications for an archived campaign.");
        }
    }

    private String normalizeCouponCode(String couponCode) {
        if (couponCode == null) {
            return null;
        }
        return couponCode.trim().toUpperCase();
    }

    private void validateCouponCode(String couponCode) {
        if (couponCode == null || !couponCode.matches(COUPON_PATTERN)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Coupon code must be 4–12 characters and contain only letters and numbers.");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BrandApplicationResponse toResponse(CampaignApplication application) {
        Campaign campaign = application.getCampaign();
        CreatorProfile creatorProfile = application.getCreatorProfile();
        return new BrandApplicationResponse(
                application.getId(),
                campaign.getId(),
                campaign.getTitle(),
                campaign.getCommissionType(),
                campaign.getCommissionValue(),
                creatorProfile.getUser().getId(),
                creatorProfile.getUser().getName(),
                creatorProfile.getInstagramHandle(),
                creatorProfile.getFollowerCount(),
                creatorProfile.getCategory(),
                creatorProfile.getCity(),
                creatorProfile.getBio(),
                creatorProfile.getProfileImageUrl(),
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
}
