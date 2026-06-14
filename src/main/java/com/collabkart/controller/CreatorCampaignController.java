package com.collabkart.controller;

import com.collabkart.dto.CampaignApplicationRequest;
import com.collabkart.dto.CampaignApplicationResponse;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.User;
import com.collabkart.service.CreatorCampaignService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/creator")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CREATOR')")
public class CreatorCampaignController {

    private final CreatorCampaignService creatorCampaignService;

    @GetMapping("/campaigns")
    public List<CampaignResponse> getCampaigns() {
        return creatorCampaignService.getLiveCampaigns();
    }

    @GetMapping("/campaigns/{id}")
    public CampaignResponse getCampaign(@PathVariable UUID id) {
        return creatorCampaignService.getLiveCampaign(id);
    }

    @PostMapping("/campaigns/{id}/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignApplicationResponse apply(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody(required = false) CampaignApplicationRequest request
    ) {
        return creatorCampaignService.apply(user, id, request);
    }

    @GetMapping("/applications")
    public List<CampaignApplicationResponse> getApplications(@AuthenticationPrincipal User user) {
        return creatorCampaignService.getApplications(user);
    }
}
