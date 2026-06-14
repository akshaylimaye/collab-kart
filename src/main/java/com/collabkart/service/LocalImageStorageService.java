package com.collabkart.service;

import com.collabkart.exception.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalImageStorageService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final String CAMPAIGN_IMAGE_DIR = "campaign-images";

    private final Path uploadBaseDir;
    private final String publicBaseUrl;

    public LocalImageStorageService(
            @Value("${app.upload.base-dir:uploads}") String uploadBaseDir,
            @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.uploadBaseDir = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    public String uploadCampaignImage(MultipartFile file) {
        validateImage(file);

        String extension = extensionFor(file.getContentType());
        String filename = UUID.randomUUID() + extension;
        Path targetDirectory = uploadBaseDir.resolve(CAMPAIGN_IMAGE_DIR).normalize();
        Path targetFile = targetDirectory.resolve(filename).normalize();

        if (!targetFile.startsWith(targetDirectory)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid product image filename");
        }

        try {
            Files.createDirectories(targetDirectory);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return publicBaseUrl + "/uploads/" + CAMPAIGN_IMAGE_DIR + "/" + filename;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store product image");
        }
    }

    public boolean hasImage(MultipartFile file) {
        return file != null && !file.isEmpty();
    }

    private void validateImage(MultipartFile file) {
        if (!hasImage(file)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product image is required");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product image must be 5MB or smaller");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product image must be a JPG, JPEG, PNG, or WEBP file");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
