package com.collabkart.controller;

import com.collabkart.dto.CampaignMultipartRequest;
import com.collabkart.dto.CampaignRequest;
import com.collabkart.dto.CampaignResponse;
import com.collabkart.entity.User;
import com.collabkart.service.CampaignService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/brand/campaigns")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BRAND')")
public class BrandCampaignController {

    private final CampaignService campaignService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse createCampaign(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CampaignRequest request
    ) {
        return campaignService.createCampaign(user, request);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse createCampaignWithImage(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute CampaignMultipartRequest request
    ) {
        return campaignService.createCampaign(user, request);
    }

    @GetMapping
    public List<CampaignResponse> getCampaigns(@AuthenticationPrincipal User user) {
        return campaignService.getBrandCampaigns(user);
    }

    @GetMapping("/{id}")
    public CampaignResponse getCampaign(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        return campaignService.getBrandCampaign(user, id);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CampaignResponse updateCampaign(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody CampaignRequest request
    ) {
        return campaignService.updateCampaign(user, id, request);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CampaignResponse updateCampaignWithImage(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @ModelAttribute CampaignMultipartRequest request
    ) {
        return campaignService.updateCampaign(user, id, request);
    }

    @PatchMapping("/{id}/publish")
    public CampaignResponse publishCampaign(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        return campaignService.publishCampaign(id, user.getId());
    }

    @PatchMapping("/{id}/archive")
    public CampaignResponse archiveCampaign(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        return campaignService.archiveCampaign(user, id);
    }
}
