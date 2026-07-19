package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.StockAdjustmentRequest;
import com.enterprise.ecommerce.model.Inventory;
import com.enterprise.ecommerce.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasRole('WAREHOUSE_MANAGER') or hasRole('ADMIN')")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventoryByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @PostMapping("/adjust")
    public ResponseEntity<Inventory> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        Inventory inventory = inventoryService.adjustStock(
                request.getProductId(),
                request.getQuantity(),
                request.getReason() != null ? request.getReason() : "Manual stock adjustment"
        );
        return ResponseEntity.ok(inventory);
    }
}
