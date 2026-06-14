package com.collabkart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.collabkart.dto.BrandApplicationResponse;
import com.collabkart.entity.ApplicationStatus;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignApplication;
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

        BrandApplicationResponse response = brandApplicationService.acceptApplication(application.getId(), brandUserId);

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.ACCEPTED);
        assertThat(response.status()).isEqualTo(ApplicationStatus.ACCEPTED);
    }

    @Test
    void brandCanRejectAppliedApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        BrandApplicationResponse response = brandApplicationService.rejectApplication(application.getId(), brandUserId);

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        assertThat(response.status()).isEqualTo(ApplicationStatus.REJECTED);
    }

    @Test
    void alreadyAcceptedApplicationCannotBeChangedAgain() {
        application.setStatus(ApplicationStatus.ACCEPTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> brandApplicationService.rejectApplication(application.getId(), brandUserId))
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

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), brandUserId))
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

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(application.getId(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void missingApplicationReturnsNotFound() {
        UUID applicationId = UUID.randomUUID();
        when(campaignApplicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> brandApplicationService.acceptApplication(applicationId, brandUserId))
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
