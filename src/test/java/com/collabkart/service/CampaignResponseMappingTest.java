package com.collabkart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.CommissionType;
import com.collabkart.entity.Role;
import com.collabkart.entity.User;
import com.collabkart.repository.BrandProfileRepository;
import com.collabkart.repository.CampaignApplicationRepository;
import com.collabkart.repository.CampaignRepository;
import com.collabkart.repository.CreatorProfileRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CampaignResponseMappingTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private BrandProfileRepository brandProfileRepository;

    @Mock
    private CampaignApplicationRepository campaignApplicationRepository;

    @Mock
    private CreatorProfileRepository creatorProfileRepository;

    @Mock
    private LocalImageStorageService localImageStorageService;

    private CampaignService campaignService;
    private CreatorCampaignService creatorCampaignService;
    private User brandUser;
    private BrandProfile brandProfile;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        campaignService = new CampaignService(campaignRepository, brandProfileRepository, localImageStorageService);
        creatorCampaignService = new CreatorCampaignService(campaignRepository, campaignApplicationRepository, creatorProfileRepository);
        brandUser = User.builder()
                .id(UUID.randomUUID())
                .name("Brand Owner")
                .email("brand@example.com")
                .passwordHash("password")
                .role(Role.BRAND)
                .build();
        brandProfile = BrandProfile.builder()
                .id(UUID.randomUUID())
                .user(brandUser)
                .brandName("Acme Beauty")
                .instagramHandle("@acmebeauty")
                .website("https://acme.example")
                .category("Beauty")
                .build();
        campaign = Campaign.builder()
                .id(UUID.randomUUID())
                .brandProfile(brandProfile)
                .title("Launch Campaign")
                .productName("Glow Serum")
                .description("Share the product with your audience.")
                .category("Skincare")
                .productImageUrl("http://localhost:8080/uploads/campaign-images/product.jpg")
                .commissionType(CommissionType.PERCENTAGE)
                .commissionValue(BigDecimal.valueOf(15))
                .status(CampaignStatus.LIVE)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void brandCampaignResponseIncludesBrandDisplayDetails() {
        when(brandProfileRepository.findByUserId(brandUser.getId())).thenReturn(Optional.of(brandProfile));
        when(campaignRepository.findByBrandProfileId(brandProfile.getId())).thenReturn(List.of(campaign));

        CampaignResponse response = campaignService.getBrandCampaigns(brandUser).get(0);

        assertBrandDetails(response);
    }

    @Test
    void creatorCampaignResponseIncludesBrandDisplayDetails() {
        when(campaignRepository.findByStatus(CampaignStatus.LIVE)).thenReturn(List.of(campaign));

        CampaignResponse response = creatorCampaignService.getLiveCampaigns().get(0);

        assertBrandDetails(response);
    }

    private void assertBrandDetails(CampaignResponse response) {
        assertThat(response.brandProfileId()).isEqualTo(brandProfile.getId());
        assertThat(response.brandName()).isEqualTo("Acme Beauty");
        assertThat(response.brandInstagramHandle()).isEqualTo("@acmebeauty");
        assertThat(response.brandWebsite()).isEqualTo("https://acme.example");
        assertThat(response.brandCategory()).isEqualTo("Beauty");
    }
}
