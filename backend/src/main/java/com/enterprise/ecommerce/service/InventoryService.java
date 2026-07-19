package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Inventory;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findLowStockProducts();
    }

    @Transactional(readOnly = true)
    public Inventory getInventoryByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found for product: " + productId));
    }

    @Transactional
    public void reserveStock(Product product, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(product.getId())
                .orElseGet(() -> inventoryRepository.save(
                        Inventory.builder()
                                .product(product)
                                .currentStock(0)
                                .reservedStock(0)
                                .availableStock(0)
                                .build()
                ));

        inventory.syncAvailableStock();
        if (inventory.getAvailableStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock available for product: " + product.getName() 
                    + " (Requested: " + quantity + ", Available: " + inventory.getAvailableStock() + ")");
        }

        inventory.setReservedStock(inventory.getReservedStock() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void releaseStock(Product product, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(product.getId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found"));

        inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - quantity));
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void deductStockAfterPayment(Product product, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(product.getId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found"));

        inventory.setCurrentStock(Math.max(0, inventory.getCurrentStock() - quantity));
        inventory.setReservedStock(Math.max(0, inventory.getReservedStock() - quantity));
        inventory.syncAvailableStock();
        inventoryRepository.save(inventory);

        if (inventory.getAvailableStock() <= inventory.getLowStockThreshold()) {
            notificationService.triggerLowStockNotification(product, inventory.getAvailableStock());
        }
    }

    @Transactional
    public Inventory adjustStock(Long productId, Integer quantity, String reason) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found"));

        inventory.setCurrentStock(Math.max(0, inventory.getCurrentStock() + quantity));
        inventory.syncAvailableStock();
        Inventory updated = inventoryRepository.save(inventory);

        System.out.println("--- STOCK ADJUSTMENT: ProductID " + productId + " adjusted by " + quantity + " due to: " + reason + " ---");
        return updated;
    }
}
