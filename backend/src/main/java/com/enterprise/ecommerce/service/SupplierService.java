package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.PurchaseOrderRequest;
import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseService warehouseService;

    // --- SUPPLIER CRUD ---

    @Transactional(readOnly = true)
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier details) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(details.getName());
        supplier.setContactEmail(details.getContactEmail());
        supplier.setPhone(details.getPhone());
        supplier.setAddress(details.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }

    // --- PURCHASE ORDERS (PROCUREMENT) ---

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getPurchaseOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = getSupplierById(request.getSupplierId());
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        PurchaseOrder po = PurchaseOrder.builder()
                .supplier(supplier)
                .warehouse(warehouse)
                .product(product)
                .quantity(request.getQuantity())
                .status(PurchaseOrderStatus.PENDING)
                .build();

        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder updatePOStatus(Long poId, PurchaseOrderStatus status) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));

        if (po.getStatus() == PurchaseOrderStatus.DELIVERED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new IllegalStateException("Finished purchase order status cannot be modified");
        }

        po.setStatus(status);

        if (status == PurchaseOrderStatus.DELIVERED) {
            warehouseService.addStockToWarehouse(
                    po.getWarehouse().getId(),
                    po.getProduct().getId(),
                    po.getQuantity()
            );
        }

        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder shipPurchaseOrder(Long poId, String trackingNumber) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));

        if (po.getStatus() != PurchaseOrderStatus.APPROVED && po.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new IllegalStateException("Only approved or pending POs can be shipped");
        }

        po.setStatus(PurchaseOrderStatus.SHIPPED);
        po.setDeliveryTrackingNumber(trackingNumber);
        return purchaseOrderRepository.save(po);
    }
}
