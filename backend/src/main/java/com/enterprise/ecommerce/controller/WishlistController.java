package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.model.Wishlist;
import com.enterprise.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/{customerId}")
    public ResponseEntity<List<Wishlist>> getWishlist(@PathVariable Long customerId) {
        return ResponseEntity.ok(wishlistService.getWishlist(customerId));
    }

    @PostMapping("/{customerId}/add")
    public ResponseEntity<Wishlist> addToWishlist(
            @PathVariable Long customerId,
            @RequestParam Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(customerId, productId));
    }

    @DeleteMapping("/{customerId}/remove")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long customerId,
            @RequestParam Long productId) {
        wishlistService.removeFromWishlist(customerId, productId);
        return ResponseEntity.ok().build();
    }
}
