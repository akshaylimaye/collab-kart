package com.collabkart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.collabkart.dto.CampaignApplicationRequest;
import com.collabkart.dto.CampaignApplicationResponse;
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
import com.collabkart.repository.CreatorProfileRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class CreatorApplicationServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignApplicationRepository campaignApplicationRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    private CreatorCampaignService creatorCampaignService;
    private User creatorUser;
    private CampaignApplication application;

    @BeforeEach
    void setUp() {
        creatorCampaignService = new CreatorCampaignService(campaignRepository, campaignApplicationRepository, creatorProfileRepository);
        creatorUser = user(Role.CREATOR, "Creator User", "creator@example.com");
        application = application(creatorUser, ApplicationStatus.APPLIED);
    }

    @Test
    void creatorCanEditOwnAppliedApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        CampaignApplicationResponse response = creatorCampaignService.updateApplicationMessage(
                creatorUser,
                application.getId(),
                new CampaignApplicationRequest(" Updated message ")
        );

        assertThat(application.getMessage()).isEqualTo("Updated message");
        assertThat(response.message()).isEqualTo("Updated message");
        assertThat(response.status()).isEqualTo(ApplicationStatus.APPLIED);
    }

    @Test
    void creatorCannotEditAcceptedApplication() {
        application.setStatus(ApplicationStatus.ACCEPTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.updateApplicationMessage(creatorUser, application.getId(), new CampaignApplicationRequest("new")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be edited.");
                });
    }

    @Test
    void creatorCannotEditRejectedApplication() {
        application.setStatus(ApplicationStatus.REJECTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.updateApplicationMessage(creatorUser, application.getId(), new CampaignApplicationRequest("new")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be edited.");
                });
    }

    @Test
    void creatorCannotEditWithdrawnApplication() {
        application.setStatus(ApplicationStatus.WITHDRAWN);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.updateApplicationMessage(creatorUser, application.getId(), new CampaignApplicationRequest("new")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be edited.");
                });
    }

    @Test
    void creatorCanWithdrawOwnAppliedApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        CampaignApplicationResponse response = creatorCampaignService.withdrawApplication(creatorUser, application.getId());

        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.WITHDRAWN);
        assertThat(response.status()).isEqualTo(ApplicationStatus.WITHDRAWN);
    }

    @Test
    void creatorCannotWithdrawAcceptedApplication() {
        application.setStatus(ApplicationStatus.ACCEPTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.withdrawApplication(creatorUser, application.getId()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be withdrawn.");
                });
    }

    @Test
    void creatorCannotWithdrawRejectedApplication() {
        application.setStatus(ApplicationStatus.REJECTED);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.withdrawApplication(creatorUser, application.getId()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be withdrawn.");
                });
    }

    @Test
    void creatorCannotWithdrawWithdrawnApplication() {
        application.setStatus(ApplicationStatus.WITHDRAWN);
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> creatorCampaignService.withdrawApplication(creatorUser, application.getId()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> {
                    ApiException exception = (ApiException) error;
                    assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getMessage()).isEqualTo("Only applied applications can be withdrawn.");
                });
    }

    @Test
    void creatorCannotEditAnotherCreatorsApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        User otherCreator = user(Role.CREATOR, "Other Creator", "other@example.com");

        assertThatThrownBy(() -> creatorCampaignService.updateApplicationMessage(otherCreator, application.getId(), new CampaignApplicationRequest("new")))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void creatorCannotWithdrawAnotherCreatorsApplication() {
        when(campaignApplicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        User otherCreator = user(Role.CREATOR, "Other Creator", "other@example.com");

        assertThatThrownBy(() -> creatorCampaignService.withdrawApplication(otherCreator, application.getId()))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    private CampaignApplication application(User creatorUser, ApplicationStatus status) {
        User brandUser = user(Role.BRAND, "Brand Owner", "brand@example.com");
        BrandProfile brandProfile = BrandProfile.builder()
                .id(UUID.randomUUID())
                .user(brandUser)
                .brandName("Acme")
                .build();
        Campaign campaign = Campaign.builder()
                .id(UUID.randomUUID())
                .brandProfile(brandProfile)
                .title("Launch Campaign")
                .productImageUrl("http://localhost:8080/uploads/campaign-images/product.jpg")
                .category("Beauty")
                .build();
        CreatorProfile creatorProfile = CreatorProfile.builder()
                .id(UUID.randomUUID())
                .user(creatorUser)
                .instagramHandle("@creator")
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

    private User user(Role role, String name, String email) {
        return User.builder()
                .id(UUID.randomUUID())
                .name(name)
                .email(email)
                .passwordHash("password")
                .role(role)
                .build();
    }
}
