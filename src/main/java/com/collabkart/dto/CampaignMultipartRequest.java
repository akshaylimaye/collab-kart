package com.collabkart.dto;

import com.collabkart.entity.CommissionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class CampaignMultipartRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title must be 180 characters or fewer")
    private String title;

    @NotBlank(message = "Product name is required")
    @Size(max = 180, message = "Product name must be 180 characters or fewer")
    private String productName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 120, message = "Category must be 120 characters or fewer")
    private String category;

    @NotNull(message = "Commission type is required")
    private CommissionType commissionType;

    @NotNull(message = "Commission value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Commission value must be greater than zero")
    private BigDecimal commissionValue;

    private MultipartFile productImage;
}
