package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductIdAndSavedForLater(Long cartId, Long productId, boolean savedForLater);
    List<CartItem> findByCartIdAndSavedForLater(Long cartId, boolean savedForLater);
    List<CartItem> findByCartId(Long cartId);
}
