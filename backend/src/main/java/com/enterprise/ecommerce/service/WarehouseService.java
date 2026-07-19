package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.Warehouse;
import com.enterprise.ecommerce.model.WarehouseStock;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.WarehouseRepository;
import com.enterprise.ecommerce.repository.WarehouseStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseStockRepository warehouseStockRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryService inventoryService;

    @Transactional(readOnly = true)
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<WarehouseStock> getStockInWarehouse(Long warehouseId) {
        return warehouseStockRepository.findByWarehouseId(warehouseId);
    }

    @Transactional
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public WarehouseStock addStockToWarehouse(Long warehouseId, Long productId, Integer quantity) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Integer currentTotal = warehouseStockRepository.getAccumulatedStockForWarehouse(warehouseId).orElse(0);
        if (currentTotal + quantity > warehouse.getMaxCapacity()) {
            throw new IllegalArgumentException("Warehouse capacity exceeded! Max capacity: " + warehouse.getMaxCapacity() 
                    + ", Current load: " + currentTotal + ", Requested add: " + quantity);
        }

        WarehouseStock stock = warehouseStockRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                .orElseGet(() -> WarehouseStock.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .stockQuantity(0)
                        .build());

        stock.setStockQuantity(stock.getStockQuantity() + quantity);
        WarehouseStock saved = warehouseStockRepository.save(stock);

        inventoryService.adjustStock(productId, quantity, "Warehouse stock receipt");

        return saved;
    }

    @Transactional
    public void transferStock(Long sourceWarehouseId, Long targetWarehouseId, Long productId, Integer quantity) {
        if (sourceWarehouseId.equals(targetWarehouseId)) {
            throw new IllegalArgumentException("Source and target warehouse must be different");
        }

        WarehouseStock sourceStock = warehouseStockRepository.findByWarehouseIdAndProductId(sourceWarehouseId, productId)
                .orElseThrow(() -> new IllegalArgumentException("No stock of product found in source warehouse"));

        if (sourceStock.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock in source warehouse. Available: " + sourceStock.getStockQuantity());
        }

        Warehouse targetWarehouse = warehouseRepository.findById(targetWarehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Target warehouse not found"));

        Integer targetTotal = warehouseStockRepository.getAccumulatedStockForWarehouse(targetWarehouseId).orElse(0);
        if (targetTotal + quantity > targetWarehouse.getMaxCapacity()) {
            throw new IllegalArgumentException("Target warehouse capacity exceeded! Max capacity: " + targetWarehouse.getMaxCapacity() 
                    + ", Current load: " + targetTotal + ", Transfer requested: " + quantity);
        }

        sourceStock.setStockQuantity(sourceStock.getStockQuantity() - quantity);
        if (sourceStock.getStockQuantity() == 0) {
            warehouseStockRepository.delete(sourceStock);
        } else {
            warehouseStockRepository.save(sourceStock);
        }

        WarehouseStock targetStock = warehouseStockRepository.findByWarehouseIdAndProductId(targetWarehouseId, productId)
                .orElseGet(() -> WarehouseStock.builder()
                        .warehouse(targetWarehouse)
                        .product(sourceStock.getProduct())
                        .stockQuantity(0)
                        .build());

        targetStock.setStockQuantity(targetStock.getStockQuantity() + quantity);
        warehouseStockRepository.save(targetStock);

        System.out.println("--- STOCK TRANSFER SUCCESSFUL: " + quantity + " units of ProductID " + productId 
                + " transferred from Warehouse " + sourceWarehouseId + " to " + targetWarehouseId + " ---");
    }
}
