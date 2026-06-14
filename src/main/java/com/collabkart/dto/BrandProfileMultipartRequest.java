package com.collabkart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class BrandProfileMultipartRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 160, message = "Brand name must be 160 characters or fewer")
    private String brandName;

    @Size(max = 255, message = "Website must be 255 characters or fewer")
    private String website;

    @Size(max = 100, message = "Instagram handle must be 100 characters or fewer")
    private String instagramHandle;

    @NotBlank(message = "Category is required")
    @Size(max = 120, message = "Category must be 120 characters or fewer")
    private String category;

    private String description;

    private MultipartFile logoImage;

    public BrandProfileRequest toRequest() {
        return new BrandProfileRequest(brandName, website, instagramHandle, category, description);
    }
}
