package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Customer;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.Wishlist;
import com.enterprise.ecommerce.repository.CustomerRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Wishlist> getWishlist(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Wishlist addToWishlist(Long customerId, Long productId) {
        if (wishlistRepository.existsByCustomerIdAndProductId(customerId, productId)) {
            throw new IllegalArgumentException("Product is already in wishlist");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Wishlist item = Wishlist.builder()
                .customer(customer)
                .product(product)
                .build();

        return wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long customerId, Long productId) {
        Wishlist item = wishlistRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in wishlist"));
        wishlistRepository.delete(item);
    }
}
