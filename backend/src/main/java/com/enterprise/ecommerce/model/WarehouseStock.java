package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_stocks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer stockQuantity;
}
