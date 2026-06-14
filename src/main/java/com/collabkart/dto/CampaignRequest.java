package com.collabkart.dto;

import com.collabkart.entity.CommissionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CampaignRequest(
        @NotBlank(message = "Title is required") @Size(max = 180, message = "Title must be 180 characters or fewer") String title,
        @NotBlank(message = "Product name is required") @Size(max = 180, message = "Product name must be 180 characters or fewer") String productName,
        @NotBlank(message = "Description is required") String description,
        @NotBlank(message = "Category is required") @Size(max = 120, message = "Category must be 120 characters or fewer") String category,
        @Size(max = 500, message = "Product image URL must be 500 characters or fewer") String productImageUrl,
        @NotNull(message = "Commission type is required") CommissionType commissionType,
        @NotNull(message = "Commission value is required") @DecimalMin(value = "0.0", inclusive = false, message = "Commission value must be greater than zero") BigDecimal commissionValue
) {
}
