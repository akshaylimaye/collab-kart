package com.collabkart.controller;

import com.collabkart.dto.CreatorProfileMultipartRequest;
import com.collabkart.dto.CreatorProfileRequest;
import com.collabkart.dto.CreatorProfileResponse;
import com.collabkart.entity.User;
import com.collabkart.service.CreatorProfileService;
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
@RequestMapping("/api/v1/creator/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CREATOR')")
public class CreatorProfileController {

    private final CreatorProfileService creatorProfileService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CreatorProfileResponse createProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreatorProfileRequest request
    ) {
        return creatorProfileService.createProfile(user, request);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CreatorProfileResponse createProfileWithImage(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute CreatorProfileMultipartRequest request
    ) {
        return creatorProfileService.createProfile(user, request.toRequest(), request.getProfileImage());
    }

    @GetMapping
    public CreatorProfileResponse getProfile(@AuthenticationPrincipal User user) {
        return creatorProfileService.getProfile(user);
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public CreatorProfileResponse updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreatorProfileRequest request
    ) {
        return creatorProfileService.updateProfile(user, request);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CreatorProfileResponse updateProfileWithImage(
            @AuthenticationPrincipal User user,
            @Valid @ModelAttribute CreatorProfileMultipartRequest request
    ) {
        return creatorProfileService.updateProfile(user, request.toRequest(), request.getProfileImage());
    }
}

