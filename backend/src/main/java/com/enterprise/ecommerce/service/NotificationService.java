package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Notification;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Transactional
    public void sendNotification(User user, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .read(false)
                .build();
        notificationRepository.save(notification);

        try {
            if (mailSender != null) {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(user.getEmail());
                mailMessage.setSubject("E-Commerce Update: " + type);
                mailMessage.setText(message);
                mailSender.send(mailMessage);
            }
        } catch (Exception e) {
            System.err.println("Could not send email update: " + e.getMessage());
        }
    }

    @Transactional
    public void triggerLowStockNotification(Product product, Integer availableStock) {
        System.out.println("--- LOW STOCK ALERT: " + product.getName() + " (SKU: " + product.getSku() + ") is running low. Current stock: " + availableStock + " ---");
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
