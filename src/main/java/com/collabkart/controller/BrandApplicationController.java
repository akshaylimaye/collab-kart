package com.collabkart.controller;

import com.collabkart.dto.BrandApplicationAcceptRequest;
import com.collabkart.dto.BrandApplicationRejectRequest;
import com.collabkart.dto.BrandApplicationResponse;
import com.collabkart.entity.User;
import com.collabkart.service.BrandApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/brand")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BRAND')")
public class BrandApplicationController {

    private final BrandApplicationService brandApplicationService;

    @GetMapping("/campaigns/{campaignId}/applications")
    public List<BrandApplicationResponse> getCampaignApplications(
            @AuthenticationPrincipal User user,
            @PathVariable UUID campaignId
    ) {
        return brandApplicationService.getApplicationsForCampaign(campaignId, user.getId());
    }

    @PatchMapping("/applications/{applicationId}/accept")
    public BrandApplicationResponse acceptApplication(
            @AuthenticationPrincipal User user,
            @PathVariable UUID applicationId,
            @Valid @RequestBody(required = false) BrandApplicationAcceptRequest request
    ) {
        return brandApplicationService.acceptApplication(applicationId, user.getId(), request);
    }

    @PatchMapping("/applications/{applicationId}/reject")
    public BrandApplicationResponse rejectApplication(
            @AuthenticationPrincipal User user,
            @PathVariable UUID applicationId,
            @Valid @RequestBody(required = false) BrandApplicationRejectRequest request
    ) {
        return brandApplicationService.rejectApplication(applicationId, user.getId(), request);
    }
}
