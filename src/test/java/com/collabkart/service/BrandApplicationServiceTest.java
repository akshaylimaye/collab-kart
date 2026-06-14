package com.collabkart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

import com.collabkart.dto.BrandApplicationAcceptRequest;
import com.collabkart.dto.BrandApplicationRejectRequest;
import com.collabkart.dto.BrandApplicationResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignApplication;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CouponStatus;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.entity.Role;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.CampaignApplicationRepository;
import com.collabkart.repository.CampaignRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class BrandApplicationServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignApplicationRepository campaignApplicationRepository;

    private BrandApplicationService brandApplicationService;
    private UUID brandUserId;
    private Campaign campaign;
    private CampaignApplication application;

    @BeforeEach
    void setUp() {
        brandApplicationService = new BrandApplicationService(campaignRepository, campaignApplicationRepository);
        brandUserId = UUID.randomUUID();
        campaign = campaign(brandUserId);
        application = application(campaign, ApplicationStatus.APPLIED);
    }

    @Test
    void brandCanViewApplicationsForOwnCampaign() {
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(campaignApplicationRepository.findByCampaignIdOrderByCreatedAtDesc(campaign.getId())).thenReturn(List.of(application));

        List<BrandApplicationResponse> responses = brandApplicationService.getApplicationsForCampaign(campaign.getId(), brandUserId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).applicationId()).isEqualTo(application.getId());
        assertThat(responses.get(0).campaignId()).isEqualTo(campaign.getId());
        assertThat(responses.get(0).campaignTitle()).isEqualTo(campaign.getTitle());
        assertThat(responses.get(0).creatorName()).isEqualTo(application.getCreatorProfile().getUser().getName());
        verify(campaignApplicationRepository).findByCampaignIdOrderByCreatedAtDesc(campaign.getId());
    }

    @Test
    void brandCannotViewApplicationsForOtherBrandCampaign() {
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));

        assertThatThrownBy(() -> brandApplicationService.getApplicationsForCampaign(campaign.getId(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void brandCanAcceptAppliedApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        when(campaignApplicationRepository.existsCouponCodeForBrand(campaign.getBrandProfile().getId(), "ACME1", application.getId())).thenReturn(false);

        BrandApplicationResponse response = brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest(" acme1 ", "Use this in reels."));

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.ACCEPTED);
        assertThat(response.status()).isEqualTo(ApplicationStatus.ACCEPTED);
        assertThat(application.getCouponCode()).isEqualTo("ACME1");
        assertThat(application.getCouponStatus()).isEqualTo(CouponStatus.ACTIVE);
        assertThat(application.getBrandInstructions()).isEqualTo("Use this in reels.");
        assertThat(application.getAcceptedAt()).isNotNull();
        assertThat(application.getCouponAssignedAt()).isNotNull();
    }

    @Test
    void brandCanRejectAppliedApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        BrandApplicationResponse response = brandApplicationService.rejectApplication(application.getId(), brandUserId, new BrandApplicationRejectRequest(" Audience mismatch "));

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        assertThat(response.status()).isEqualTo(ApplicationStatus.REJECTED);
        assertThat(application.getRejectionReason()).isEqualTo("Audience mismatch");
        assertThat(application.getRejectedAt()).isNotNull();
    }


    @Test
    void acceptFailsWithoutCouponCode() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest(" ", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Coupon code must be 4–12 characters and contain only letters and numbers.");
                });
        verify(campaignApplicationRepository, never()).existsCouponCodeForBrand(campaign.getBrandProfile().getId(), "", application.getId());
    }

    @Test
    void acceptFailsWithInvalidCouponCode() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest("BAD_CODE", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Coupon code must be 4–12 characters and contain only letters and numbers.");
                });
    }

    @Test
    void acceptFailsWithDuplicateCouponForSameBrand() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(campaignApplicationRepository.existsCouponCodeForBrand(campaign.getBrandProfile().getId(), "ACME1", application.getId())).thenReturn(true);

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest("ACME1", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("Coupon code already exists for this brand. Please use a different code.");
                });
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
    }


    @Test
    void cannotAcceptAppliedApplicationWhenCampaignIsArchived() {
        campaign.setStatus(CampaignStatus.ARCHIVED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest("ACME1", "Instructions")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("Cannot review applications for an archived campaign.");
                });

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(application.getCouponCode()).isNull();
        assertThat(application.getBrandInstructions()).isNull();
        assertThat(application.getAcceptedAt()).isNull();
        assertThat(application.getCouponAssignedAt()).isNull();
        verify(campaignApplicationRepository, never()).existsCouponCodeForBrand(campaign.getBrandProfile().getId(), "ACME1", application.getId());
    }

    @Test
    void cannotRejectAppliedApplicationWhenCampaignIsArchived() {
        campaign.setStatus(CampaignStatus.ARCHIVED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.rejectApplication(application.getId(), brandUserId, new BrandApplicationRejectRequest("Not now")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("Cannot review applications for an archived campaign.");
                });

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(application.getRejectionReason()).isNull();
        assertThat(application.getRejectedAt()).isNull();
    }

    @Test
    void alreadyAcceptedApplicationCannotBeChangedAgain() {
        application.setStatus(ApplicationStatus.ACCEPTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.rejectApplication(application.getId(), brandUserId, new BrandApplicationRejectRequest(null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("Application has already been processed.");
                });
    }

    @Test
    void alreadyRejectedApplicationCannotBeChangedAgain() {
        application.setStatus(ApplicationStatus.REJECTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId, new BrandApplicationAcceptRequest("ACME1", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getMessage()).isEqualTo("Application has already been processed.");
                });
    }

    @Test
    void otherBrandCannotAcceptApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), UUID.randomUUID(), new BrandApplicationAcceptRequest("ACME1", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void missingApplicationReturnsNotFound() {
        UUID applicationId = UUID.randomUUID();
        when(campaignApplicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(applicationId, brandUserId, new BrandApplicationAcceptRequest("ACME1", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    private Campaign campaign(UUID brandUserId) {
        User brandUser = User.builder()
                .id(brandUserId)
                .name("Brand Owner")
                .email("brand@example.com")
                .passwordHash("password")
                .role(Role.BRAND)
                .build();
        BrandProfile brandProfile = BrandProfile.builder()
                .id(UUID.randomUUID())
                .user(brandUser)
                .brandName("Acme")
                .build();
        return Campaign.builder()
                .id(UUID.randomUUID())
                .brandProfile(brandProfile)
                .title("Launch Campaign")
                .commissionType(com.collabkart.entity.CommissionType.PERCENTAGE)
                .commissionValue(new java.math.BigDecimal("12"))
                .status(CampaignStatus.LIVE)
                .build();
    }

    private CampaignApplication application(Campaign campaign, ApplicationStatus status) {
        User creatorUser = User.builder()
                .id(UUID.randomUUID())
                .name("Creator User")
                .email("creator@example.com")
                .passwordHash("password")
                .role(Role.CREATOR)
                .build();
        CreatorProfile creatorProfile = CreatorProfile.builder()
                .id(UUID.randomUUID())
                .user(creatorUser)
                .instagramHandle("@creator")
                .followerCount(12000)
                .category("Beauty")
                .build();
        return CampaignApplication.builder()
                .id(UUID.randomUUID())
                .campaign(campaign)
                .creatorProfile(creatorProfile)
                .message("I am a good fit.")
                .status(status)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }
}
