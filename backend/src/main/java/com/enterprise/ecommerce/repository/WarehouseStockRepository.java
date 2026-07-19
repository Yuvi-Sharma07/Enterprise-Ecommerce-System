package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    Optional<WarehouseStock> findByWarehouseIdAndProductId(Long warehouseId, Long productId);
    List<WarehouseStock> findByWarehouseId(Long warehouseId);
    List<WarehouseStock> findByProductId(Long productId);

    @Query("SELECT SUM(ws.stockQuantity) FROM WarehouseStock ws WHERE ws.warehouse.id = :warehouseId")
    Optional<Integer> getAccumulatedStockForWarehouse(@Param("warehouseId") Long warehouseId);
}
