package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByProductIdAndApproved(Long productId, boolean approved);
    List<Review> findByApprovedFalse(); // For admin moderation

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Optional<Double> getAverageRatingForProduct(@Param("productId") Long productId);
}
