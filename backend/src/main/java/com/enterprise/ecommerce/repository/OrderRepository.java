package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Order;
import com.enterprise.ecommerce.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')")
    BigDecimal sumTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.status NOT IN ('CANCELLED', 'REFUNDED')")
    BigDecimal sumTotalRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query(value = "SELECT p.name AS name, SUM(oi.quantity) AS qty " +
            "FROM order_items oi " +
            "JOIN products p ON oi.product_id = p.id " +
            "JOIN orders o ON oi.order_id = o.id " +
            "WHERE o.status NOT IN ('CANCELLED', 'REFUNDED') " +
            "GROUP BY p.id, p.name " +
            "ORDER BY qty DESC LIMIT :limit", nativeQuery = true)
    List<Map<String, Object>> getBestSellingProducts(@Param("limit") int limit);

    @Query(value = "SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month, SUM(o.total_amount) AS sales " +
            "FROM orders o " +
            "WHERE o.status NOT IN ('CANCELLED', 'REFUNDED') " +
            "GROUP BY TO_CHAR(o.created_at, 'YYYY-MM') " +
            "ORDER BY month DESC LIMIT 12", nativeQuery = true)
    List<Map<String, Object>> getMonthlySalesData();
}
