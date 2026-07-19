package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private Integer usageLimit;

    @Builder.Default
    @Column(nullable = false)
    private Integer usageCount = 0;

    @Builder.Default
    private boolean active = true;

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDateTime.now());
    }

    public boolean isLimitReached() {
        return usageLimit != null && usageCount >= usageLimit;
    }

    public boolean isValid() {
        return active && !isExpired() && !isLimitReached();
    }
}
