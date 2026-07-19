package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    Boolean existsBySku(String sku);
    Page<Product> findByActiveTrue(Pageable pageable);
}
