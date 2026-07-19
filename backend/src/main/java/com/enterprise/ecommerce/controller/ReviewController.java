package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.model.Review;
import com.enterprise.ecommerce.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getApprovedReviewsForProduct(productId));
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getProductAverageRating(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAverageRatingForProduct(productId));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(
            @RequestParam Long productId,
            @RequestParam Long customerId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String reviewText) {
        Review review = reviewService.createReview(productId, customerId, rating, reviewText);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getPendingReviews() {
        return ResponseEntity.ok(reviewService.getPendingReviews());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.approveReview(id));
    }
}
