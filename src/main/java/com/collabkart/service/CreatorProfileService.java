package com.collabkart.service;

import com.collabkart.dto.CreatorProfileRequest;
import com.collabkart.dto.CreatorProfileResponse;
import com.collabkart.entity.CreatorProfile;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.CreatorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreatorProfileService {

    private final CreatorProfileRepository creatorProfileRepository;

    @Transactional
    public CreatorProfileResponse createProfile(User user, CreatorProfileRequest request) {
        if (creatorProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Creator profile already exists");
        }

        CreatorProfile profile = CreatorProfile.builder()
                .user(user)
                .instagramHandle(request.instagramHandle())
                .followerCount(request.followerCount())
                .category(request.category())
                .bio(request.bio())
                .city(request.city())
                .build();

        return toResponse(creatorProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public CreatorProfileResponse getProfile(User user) {
        return creatorProfileRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Creator profile not found"));
    }

    @Transactional
    public CreatorProfileResponse updateProfile(User user, CreatorProfileRequest request) {
        CreatorProfile profile = creatorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Creator profile not found"));

        profile.setInstagramHandle(request.instagramHandle());
        profile.setFollowerCount(request.followerCount());
        profile.setCategory(request.category());
        profile.setBio(request.bio());
        profile.setCity(request.city());

        return toResponse(profile);
    }

    private CreatorProfileResponse toResponse(CreatorProfile profile) {
        return new CreatorProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getInstagramHandle(),
                profile.getFollowerCount(),
                profile.getCategory(),
                profile.getBio(),
                profile.getCity()
        );
    }
}
