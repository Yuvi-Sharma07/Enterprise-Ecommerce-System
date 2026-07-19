package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.CartDTO;
import com.enterprise.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{customerId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long customerId) {
        CartDTO cart = cartService.getCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{customerId}/add")
    public ResponseEntity<CartDTO> addItem(
            @PathVariable Long customerId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        CartDTO cart = cartService.addItemToCart(customerId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/{customerId}/update")
    public ResponseEntity<CartDTO> updateItem(
            @PathVariable Long customerId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        CartDTO cart = cartService.updateItemQuantity(customerId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{customerId}/toggle-save")
    public ResponseEntity<CartDTO> toggleSaveForLater(
            @PathVariable Long customerId,
            @RequestParam Long productId) {
        CartDTO cart = cartService.toggleSaveForLater(customerId, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{customerId}/remove")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long customerId,
            @RequestParam Long productId) {
        CartDTO cart = cartService.removeItemFromCart(customerId, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{customerId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok().build();
    }
}
