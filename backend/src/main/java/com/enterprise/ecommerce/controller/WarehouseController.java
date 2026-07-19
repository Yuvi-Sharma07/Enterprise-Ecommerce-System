package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.StockTransferRequest;
import com.enterprise.ecommerce.model.Warehouse;
import com.enterprise.ecommerce.model.WarehouseStock;
import com.enterprise.ecommerce.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@PreAuthorize("hasRole('WAREHOUSE_MANAGER') or hasRole('ADMIN')")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<List<WarehouseStock>> getWarehouseStock(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getStockInWarehouse(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.createWarehouse(warehouse));
    }

    @PostMapping("/{id}/add-stock")
    public ResponseEntity<WarehouseStock> addStock(
            @PathVariable Long id,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        WarehouseStock stock = warehouseService.addStockToWarehouse(id, productId, quantity);
        return ResponseEntity.ok(stock);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transferStock(@Valid @RequestBody StockTransferRequest request) {
        warehouseService.transferStock(
                request.getSourceWarehouseId(),
                request.getTargetWarehouseId(),
                request.getProductId(),
                request.getQuantity()
        );
        return ResponseEntity.ok().build();
    }
}
