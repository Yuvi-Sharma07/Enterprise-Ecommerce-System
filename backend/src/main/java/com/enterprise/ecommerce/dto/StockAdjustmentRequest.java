package com.enterprise.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockAdjustmentRequest {
    @NotNull
    private Long productId;

    @NotNull
    private Integer quantity; // positive for addition, negative for deduction

    private String reason;
}
