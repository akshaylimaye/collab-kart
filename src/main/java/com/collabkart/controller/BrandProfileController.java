package com.collabkart.controller;

import com.collabkart.dto.BrandProfileMultipartRequest;
import com.collabkart.dto.BrandProfileRequest;
import com.collabkart.dto.BrandProfileResponse;
import com.collabkart.entity.User;
import com.collabkart.service.BrandProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/brand/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BRAND')")
public class BrandProfileController {

    private final BrandProfileService brandProfileService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public BrandProfileResponse createProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BrandProfileRequest request
    ) {
        return brandProfileService.createProfile(user, request);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public BrandProfileResponse createProfileWithLogo(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute BrandProfileMultipartRequest request
    ) {
        return brandProfileService.createProfile(user, request.toRequest(), request.getLogoImage());
    }

    @GetMapping
    public BrandProfileResponse getProfile(@AuthenticationPrincipal User user) {
        return brandProfileService.getProfile(user);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public BrandProfileResponse updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BrandProfileRequest request
    ) {
        return brandProfileService.updateProfile(user, request);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BrandProfileResponse updateProfileWithLogo(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute BrandProfileMultipartRequest request
    ) {
        return brandProfileService.updateProfile(user, request.toRequest(), request.getLogoImage());
    }
}

