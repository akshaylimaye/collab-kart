package com.collabkart.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String uploadCampaignImage(MultipartFile file);

    String uploadCreatorProfileImage(MultipartFile file);

    String uploadBrandLogo(MultipartFile file);

    default boolean hasImage(MultipartFile file) {
        return file != null && !file.isEmpty();
    }
}
