package com.collabkart.service;

import com.collabkart.exception.ApiException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Primary
@ConditionalOnExpression("T(org.springframework.util.StringUtils).hasText('${CLOUDINARY_CLOUD_NAME:}') && T(org.springframework.util.StringUtils).hasText('${CLOUDINARY_API_KEY:}') && T(org.springframework.util.StringUtils).hasText('${CLOUDINARY_API_SECRET:}')")
public class CloudinaryImageStorageService implements ImageStorageService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final String CAMPAIGN_IMAGE_DIR = "campaign-images";
    private static final String CREATOR_PROFILE_DIR = "creator-profiles";
    private static final String BRAND_LOGO_DIR = "brand-logos";

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final String baseFolder;
    private final HttpClient httpClient;

    public CloudinaryImageStorageService(
            @Value("${CLOUDINARY_CLOUD_NAME}") String cloudName,
            @Value("${CLOUDINARY_API_KEY}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET}") String apiSecret,
            @Value("${CLOUDINARY_FOLDER:collabkart}") String baseFolder
    ) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseFolder = trimSlashes(baseFolder == null || baseFolder.isBlank() ? "collabkart" : baseFolder);
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public String uploadCampaignImage(MultipartFile file) {
        return uploadImage(file, CAMPAIGN_IMAGE_DIR, "campaign-image");
    }

    @Override
    public String uploadCreatorProfileImage(MultipartFile file) {
        return uploadImage(file, CREATOR_PROFILE_DIR, "creator-profile");
    }

    @Override
    public String uploadBrandLogo(MultipartFile file) {
        return uploadImage(file, BRAND_LOGO_DIR, "brand-logo");
    }

    private String uploadImage(MultipartFile file, String folderName, String publicIdPrefix) {
        validateImage(file);

        String folder = baseFolder + "/" + folderName;
        long timestamp = Instant.now().getEpochSecond();
        String publicId = publicIdPrefix + "-" + UUID.randomUUID();
        Map<String, String> params = new HashMap<>();
        params.put("folder", folder);
        params.put("public_id", publicId);
        params.put("timestamp", String.valueOf(timestamp));
        String signature = sign(params);

        String boundary = "----collabkart-" + UUID.randomUUID();
        byte[] body;
        try {
            body = multipartBody(boundary, params, signature, file);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to read uploaded image");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to upload image to Cloudinary");
            }
            return secureUrl(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload was interrupted");
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to upload image to Cloudinary");
        }
    }

    private void validateImage(MultipartFile file) {
        if (!hasImage(file)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image is required");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image must be 5MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, and WEBP images are allowed");
        }
    }

    private String sign(Map<String, String> params) {
        String payload = params.entrySet().stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&")) + apiSecret;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte value : hash) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to prepare image upload");
        }
    }

    private byte[] multipartBody(String boundary, Map<String, String> params, String signature, MultipartFile file) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        writeField(output, boundary, "api_key", apiKey);
        writeField(output, boundary, "signature", signature);
        for (Map.Entry<String, String> entry : params.entrySet()) {
            writeField(output, boundary, entry.getKey(), entry.getValue());
        }
        writeFile(output, boundary, file);
        output.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        return output.toByteArray();
    }

    private void writeField(ByteArrayOutputStream output, String boundary, String name, String value) throws IOException {
        output.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(value.getBytes(StandardCharsets.UTF_8));
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeFile(ByteArrayOutputStream output, String boundary, MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() == null || file.getOriginalFilename().isBlank() ? "image" : file.getOriginalFilename();
        output.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + sanitizeFilename(filename) + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        output.write(file.getBytes());
        output.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String secureUrl(String responseBody) {
        String marker = "\"secure_url\":\"";
        int start = responseBody.indexOf(marker);
        if (start < 0) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloudinary response did not include an image URL");
        }
        start += marker.length();
        int end = responseBody.indexOf('"', start);
        if (end <= start) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloudinary response did not include an image URL");
        }
        return responseBody.substring(start, end).replace("\\/", "/");
    }

    private String trimSlashes(String value) {
        return value.replaceAll("^/+|/+$", "");
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
