package com.collabkart.service;

import com.collabkart.dto.BrandProfileRequest;
import com.collabkart.dto.BrandProfileResponse;
import com.collabkart.entity.BrandProfile;
import com.collabkart.entity.User;
import com.collabkart.exception.ApiException;
import com.collabkart.repository.BrandProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandProfileService {

    private final BrandProfileRepository brandProfileRepository;

    @Transactional
    public BrandProfileResponse createProfile(User user, BrandProfileRequest request) {
        if (brandProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Brand profile already exists");
        }

        BrandProfile profile = BrandProfile.builder()
                .user(user)
                .brandName(request.brandName().trim())
                .website(request.website())
                .instagramHandle(request.instagramHandle())
                .category(request.category())
                .description(request.description())
                .build();

        return toResponse(brandProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public BrandProfileResponse getProfile(User user) {
        return brandProfileRepository.findByUserId(user.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Brand profile not found"));
    }

    @Transactional
    public BrandProfileResponse updateProfile(User user, BrandProfileRequest request) {
        BrandProfile profile = brandProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Brand profile not found"));

        profile.setBrandName(request.brandName().trim());
        profile.setWebsite(request.website());
        profile.setInstagramHandle(request.instagramHandle());
        profile.setCategory(request.category());
        profile.setDescription(request.description());

        return toResponse(profile);
    }

    private BrandProfileResponse toResponse(BrandProfile profile) {
        return new BrandProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getBrandName(),
                profile.getWebsite(),
                profile.getInstagramHandle(),
                profile.getCategory(),
                profile.getDescription()
        );
    }
}
