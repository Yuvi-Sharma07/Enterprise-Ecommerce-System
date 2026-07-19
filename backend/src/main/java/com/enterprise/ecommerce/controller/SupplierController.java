package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.PurchaseOrderRequest;
import com.enterprise.ecommerce.model.PurchaseOrder;
import com.enterprise.ecommerce.model.PurchaseOrderStatus;
import com.enterprise.ecommerce.model.Supplier;
import com.enterprise.ecommerce.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasRole('SUPPLIER')")
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasRole('SUPPLIER')")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Supplier> createSupplier(@Valid @RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.createSupplier(supplier));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @Valid @RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, supplier));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    // --- PURCHASE ORDERS ---

    @GetMapping("/pos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasRole('SUPPLIER')")
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(supplierService.getAllPurchaseOrders());
    }

    @GetMapping("/pos/supplier/{supplierId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPLIER')")
    public ResponseEntity<List<PurchaseOrder>> getPOSBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierService.getPurchaseOrdersBySupplier(supplierId));
    }

    @PostMapping("/pos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(supplierService.createPurchaseOrder(request));
    }

    @PutMapping("/pos/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasRole('SUPPLIER')")
    public ResponseEntity<PurchaseOrder> updatePOStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrderStatus status) {
        return ResponseEntity.ok(supplierService.updatePOStatus(id, status));
    }

    @PutMapping("/pos/{id}/ship")
    @PreAuthorize("hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<PurchaseOrder> shipPurchaseOrder(
            @PathVariable Long id,
            @RequestParam String trackingNumber) {
        return ResponseEntity.ok(supplierService.shipPurchaseOrder(id, trackingNumber));
    }
}
