package com.enterprise.ecommerce.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id;
    private Long customerId;
    private List<CartItemDTO> items;
    private BigDecimal totalAmount;
}
