package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Customer;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.Review;
import com.enterprise.ecommerce.repository.CustomerRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<Review> getApprovedReviewsForProduct(Long productId) {
        return reviewRepository.findByProductIdAndApproved(productId, true);
    }

    @Transactional(readOnly = true)
    public List<Review> getPendingReviews() {
        return reviewRepository.findByApprovedFalse();
    }

    @Transactional
    public Review createReview(Long productId, Long customerId, Integer rating, String reviewText) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .product(product)
                .customer(customer)
                .rating(rating)
                .reviewText(reviewText)
                .approved(false) // Needs admin moderation
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setApproved(true);
        Review approved = reviewRepository.save(review);

        System.out.println("--- REVIEW APPROVED: ReviewID " + reviewId + " approved by Admin ---");
        return approved;
    }

    @Transactional(readOnly = true)
    public Double getAverageRatingForProduct(Long productId) {
        return reviewRepository.getAverageRatingForProduct(productId).orElse(0.0);
    }
}
