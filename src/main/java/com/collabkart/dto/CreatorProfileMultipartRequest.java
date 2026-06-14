package com.collabkart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CreatorProfileMultipartRequest {

    @Size(max = 100, message = "Instagram handle must be 100 characters or fewer")
    private String instagramHandle;

    @PositiveOrZero(message = "Follower count cannot be negative")
    private Integer followerCount;

    @NotBlank(message = "Category is required")
    @Size(max = 120, message = "Category must be 120 characters or fewer")
    private String category;

    private String bio;

    @Size(max = 120, message = "City must be 120 characters or fewer")
    private String city;

    private MultipartFile profileImage;

    public CreatorProfileRequest toRequest() {
        return new CreatorProfileRequest(instagramHandle, followerCount, category, bio, city);
    }
}
