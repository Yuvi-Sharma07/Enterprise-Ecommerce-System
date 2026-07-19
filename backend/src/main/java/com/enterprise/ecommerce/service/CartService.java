package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.CartDTO;
import com.enterprise.ecommerce.dto.CartItemDTO;
import com.enterprise.ecommerce.model.Cart;
import com.enterprise.ecommerce.model.CartItem;
import com.enterprise.ecommerce.model.Customer;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.repository.CartItemRepository;
import com.enterprise.ecommerce.repository.CartRepository;
import com.enterprise.ecommerce.repository.CustomerRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCartEntity(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional(readOnly = true)
    public CartDTO getCart(Long customerId) {
        Cart cart = getOrCreateCartEntity(customerId);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO addItemToCart(Long customerId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCartEntity(customerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, false);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .savedForLater(false)
                    .build();
            cartItemRepository.save(item);
        }

        return convertToDTO(getOrCreateCartEntity(customerId));
    }

    @Transactional
    public CartDTO updateItemQuantity(Long customerId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCartEntity(customerId);
        CartItem item = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, false)
                .orElseThrow(() -> new IllegalArgumentException("Item not found in active cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return convertToDTO(getOrCreateCartEntity(customerId));
    }

    @Transactional
    public CartDTO removeItemFromCart(Long customerId, Long productId) {
        Cart cart = getOrCreateCartEntity(customerId);
        Optional<CartItem> item = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, false);
        item.ifPresent(cartItemRepository::delete);

        Optional<CartItem> savedItem = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, true);
        savedItem.ifPresent(cartItemRepository::delete);

        return convertToDTO(getOrCreateCartEntity(customerId));
    }

    @Transactional
    public CartDTO toggleSaveForLater(Long customerId, Long productId) {
        Cart cart = getOrCreateCartEntity(customerId);

        Optional<CartItem> activeItem = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, false);
        if (activeItem.isPresent()) {
            CartItem item = activeItem.get();
            item.setSavedForLater(true);
            cartItemRepository.save(item);
        } else {
            Optional<CartItem> savedItem = cartItemRepository.findByCartIdAndProductIdAndSavedForLater(cart.getId(), productId, true);
            if (savedItem.isPresent()) {
                CartItem item = savedItem.get();
                item.setSavedForLater(false);
                cartItemRepository.save(item);
            }
        }

        return convertToDTO(getOrCreateCartEntity(customerId));
    }

    @Transactional
    public void clearCart(Long customerId) {
        Cart cart = getOrCreateCartEntity(customerId);
        List<CartItem> activeItems = cartItemRepository.findByCartIdAndSavedForLater(cart.getId(), false);
        cartItemRepository.deleteAll(activeItems);
    }

    private CartDTO convertToDTO(Cart cart) {
        List<CartItem> allItems = cartItemRepository.findByCartId(cart.getId());

        List<CartItemDTO> itemDTOs = allItems.stream()
                .map(item -> CartItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .price(item.getProduct().getPrice())
                        .imageUrl(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .savedForLater(item.isSavedForLater())
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = allItems.stream()
                .filter(item -> !item.isSavedForLater())
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer().getId())
                .items(itemDTOs)
                .totalAmount(total)
                .build();
    }
}
