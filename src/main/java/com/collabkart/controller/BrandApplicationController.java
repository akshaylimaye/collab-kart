package com.collabkart.controller;

import com.collabkart.dto.CampaignApplicationResponse;
import com.collabkart.entity.User;
import com.collabkart.service.BrandApplicationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/brand")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BRAND')")
public class BrandApplicationController {

    private final BrandApplicationService brandApplicationService;

    @GetMapping("/campaigns/{campaignId}/applications")
    public List<CampaignApplicationResponse> getCampaignApplications(
            @AuthenticationPrincipal User user,
            @PathVariable UUID campaignId
    ) {
        return brandApplicationService.getCampaignApplications(user, campaignId);
    }

    @PatchMapping("/applications/{applicationId}/accept")
    public CampaignApplicationResponse acceptApplication(
            @AuthenticationPrincipal User user,
            @PathVariable UUID applicationId
    ) {
        return brandApplicationService.acceptApplication(user, applicationId);
    }

    @PatchMapping("/applications/{applicationId}/reject")
    public CampaignApplicationResponse rejectApplication(
            @AuthenticationPrincipal User user,
            @PathVariable UUID applicationId
    ) {
        return brandApplicationService.rejectApplication(user, applicationId);
    }
}
