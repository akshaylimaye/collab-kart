package com.collabkart.service;

import com.collabkart.dto.CampaignResponse;
import com.collabkart.dto.UserResponse;
import com.collabkart.entity.Campaign;
import com.collabkart.entity.User;
import com.collabkart.repository.CampaignRepository;
import com.collabkart.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
