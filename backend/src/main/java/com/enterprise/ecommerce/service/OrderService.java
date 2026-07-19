package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.*;
import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<OrderDTO> getCustomerOrders(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO checkout(CheckoutRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Cart cart = cartService.getOrCreateCartEntity(customer.getId());
        List<CartItem> activeItems = cartItemRepository.findByCartIdAndSavedForLater(cart.getId(), false);

        if (activeItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // 1. Reserve Stock first
        for (CartItem item : activeItems) {
            inventoryService.reserveStock(item.getProduct(), item.getQuantity());
        }

        // 2. Calculate totals
        BigDecimal subtotal = activeItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = subtotal;
        Coupon appliedCoupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            appliedCoupon = couponService.validateCoupon(request.getCouponCode());
            if (appliedCoupon.getDiscountType() == DiscountType.PERCENTAGE) {
                BigDecimal discount = subtotal.multiply(appliedCoupon.getDiscountValue().divide(BigDecimal.valueOf(100)));
                total = subtotal.subtract(discount);
            } else {
                total = subtotal.subtract(appliedCoupon.getDiscountValue());
            }
            total = total.max(BigDecimal.ZERO); // Clamp to positive
            couponService.incrementCouponUsage(appliedCoupon.getCode());
        }

        // 3. Create Order
        Order order = Order.builder()
                .customer(customer)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 4. Save items
        for (CartItem item : activeItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .price(item.getProduct().getPrice())
                    .build();
            savedOrder.getItems().add(orderItem);
        }

        Order finalOrder = orderRepository.save(savedOrder);
        return convertToDTO(finalOrder);
    }

    @Transactional
    public OrderDTO confirmOrderPayment(Long orderId, String stripeToken) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Order is not in PENDING state");
        }

        // 1. Process Stripe payment
        Payment payment = paymentService.processPayment(order, stripeToken);

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            // 2. Transition state
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // 3. Deduct stock physically (releases reservation, deducts current stock)
            for (OrderItem item : order.getItems()) {
                inventoryService.deductStockAfterPayment(item.getProduct(), item.getQuantity());
            }

            // 4. Clear active items from cart
            cartService.clearCart(order.getCustomer().getId());

            // 5. Notify customer
            notificationService.sendNotification(
                    order.getCustomer().getUser(),
                    "Your order #" + order.getId() + " has been successfully paid and confirmed!",
                    "ORDER_CONFIRMED"
            );
        } else {
            // Cancel order if payment failed
            cancelOrderInternal(order);
        }

        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Validate state transitions
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot change status of a finished order: " + order.getStatus());
        }

        order.setStatus(status);

        if (status == OrderStatus.SHIPPED) {
            order.setTrackingNumber("TRK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            notificationService.sendNotification(
                    order.getCustomer().getUser(),
                    "Good news! Your order #" + order.getId() + " has been shipped. Tracking: " + order.getTrackingNumber(),
                    "ORDER_SHIPPED"
            );
        } else if (status == OrderStatus.DELIVERED) {
            notificationService.sendNotification(
                    order.getCustomer().getUser(),
                    "Your order #" + order.getId() + " has been delivered!",
                    "ORDER_DELIVERED"
            );
        } else if (status == OrderStatus.COMPLETED) {
            notificationService.sendNotification(
                    order.getCustomer().getUser(),
                    "Your order #" + order.getId() + " is marked as completed. Thank you for shopping with us!",
                    "ORDER_COMPLETED"
            );
        }

        Order saved = orderRepository.save(order);
        return convertToDTO(saved);
    }

    @Transactional
    public OrderDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PACKED) {
            throw new IllegalStateException("Order cannot be cancelled at this stage: " + order.getStatus());
        }

        cancelOrderInternal(order);
        return convertToDTO(order);
    }

    private void cancelOrderInternal(Order order) {
        OrderStatus prevStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Release stock
        for (OrderItem item : order.getItems()) {
            if (prevStatus == OrderStatus.PENDING) {
                // Was only reserved
                inventoryService.releaseStock(item.getProduct(), item.getQuantity());
            } else {
                // Was already paid and deducted from currentStock, so return it to currentStock
                inventoryService.adjustStock(item.getProduct().getId(), item.getQuantity(), "Order cancellation refund");
            }
        }

        // Process Stripe refund if it was paid
        if (prevStatus != OrderStatus.PENDING) {
            paymentService.processRefund(order);
        }

        notificationService.sendNotification(
                order.getCustomer().getUser(),
                "Your order #" + order.getId() + " has been cancelled.",
                "ORDER_CANCELLED"
        );
    }

    @Transactional
    public OrderDTO requestReturn(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Return requests are only allowed for delivered or completed orders");
        }

        order.setStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        // Refund stock back to inventory
        for (OrderItem item : order.getItems()) {
            inventoryService.adjustStock(item.getProduct().getId(), item.getQuantity(), "Order return receipt");
        }

        // Refund Stripe payment
        paymentService.processRefund(order);

        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> items = order.getItems().stream()
                .map(item -> OrderItemDTO.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        String custName = order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName();

        return OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(custName)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .trackingNumber(order.getTrackingNumber())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
