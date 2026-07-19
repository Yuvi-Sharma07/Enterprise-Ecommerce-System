package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.PurchaseOrder;
import com.enterprise.ecommerce.model.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByWarehouseId(Long warehouseId);
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
}
