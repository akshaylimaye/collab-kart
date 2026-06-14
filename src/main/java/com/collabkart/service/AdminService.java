package com.collabkart.service;

import com.collabkart.dto.CampaignResponse;
import com.collabkart.dto.UserResponse;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.CampaignStatus;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.CampaignRepository;
import com.collabkart.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns() {
        return campaignRepository.findAll()
                .stream()
                .map(this::toCampaignResponse)
                .toList();
    }

    @Transactional
    public CampaignResponse approveCampaign(UUID campaignId) {
        Campaign campaign = getCampaign(campaignId);
        ensurePendingReview(campaign);
        campaign.setStatus(CampaignStatus.LIVE);
        return toCampaignResponse(campaign);
    }

    @Transactional
    public CampaignResponse rejectCampaign(UUID campaignId) {
        Campaign campaign = getCampaign(campaignId);
        ensurePendingReview(campaign);
        campaign.setStatus(CampaignStatus.REJECTED);
        return toCampaignResponse(campaign);
    }

    private Campaign getCampaign(UUID campaignId) {
        return campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Campaign not found"));
    }

    private void ensurePendingReview(Campaign campaign) {
        if (campaign.getStatus() != CampaignStatus.PENDING_REVIEW) {
            throw new ApiException(HttpStatus.CONFLICT, "Campaign is not pending review");
        }
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
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
