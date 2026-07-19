package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer currentStock;

    @Column(nullable = false)
    @Builder.Default
    private Integer reservedStock = 0;

    @Column(nullable = false)
    private Integer availableStock;

    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 10;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        syncAvailableStock();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        syncAvailableStock();
    }

    public void syncAvailableStock() {
        if (this.currentStock != null && this.reservedStock != null) {
            this.availableStock = this.currentStock - this.reservedStock;
        }
    }
}
