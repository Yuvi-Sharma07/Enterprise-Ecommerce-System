package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.CheckoutRequest;
import com.enterprise.ecommerce.model.Cart;
import com.enterprise.ecommerce.model.Customer;
import com.enterprise.ecommerce.repository.CartItemRepository;
import com.enterprise.ecommerce.repository.CustomerRepository;
import com.enterprise.ecommerce.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.ArrayList;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private CartService cartService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private CouponService couponService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void checkout_EmptyCart_ThrowsException() {
        CheckoutRequest request = new CheckoutRequest();
        request.setCustomerId(1L);

        Customer customer = Customer.builder().id(1L).firstName("John").lastName("Doe").build();
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        
        Cart cart = Cart.builder().id(1L).customer(customer).build();
        when(cartService.getOrCreateCartEntity(1L)).thenReturn(cart);
        when(cartItemRepository.findByCartIdAndSavedForLater(1L, false)).thenReturn(new ArrayList<>());

        assertThrows(IllegalArgumentException.class, () -> orderService.checkout(request));
    }
}
