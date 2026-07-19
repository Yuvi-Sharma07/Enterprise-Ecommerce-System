package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.AuditLog;
import com.enterprise.ecommerce.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(Long userId, String email, String action, String details, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .userEmail(email)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogs() {
        return auditLogRepository.findByOrderByCreatedAtDesc();
    }
}
