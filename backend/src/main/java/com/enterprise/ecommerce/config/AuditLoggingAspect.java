package com.enterprise.ecommerce.config;

import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditLoggingAspect {

    @Autowired
    private AuditLogService auditLogService;

    @AfterReturning(pointcut = "execution(* com.enterprise.ecommerce.controller.ProductController.createProduct(..)) || " +
            "execution(* com.enterprise.ecommerce.controller.ProductController.updateProduct(..)) || " +
            "execution(* com.enterprise.ecommerce.controller.ProductController.deleteProduct(..)) || " +
            "execution(* com.enterprise.ecommerce.controller.InventoryController.adjustStock(..)) || " +
            "execution(* com.enterprise.ecommerce.controller.WarehouseController.transferStock(..))",
            returning = "result")
    public void logAdminActions(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String action = convertMethodToInterfaceAction(methodName);

        String email = "Anonymous";
        Long userId = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl user = (UserDetailsImpl) auth.getPrincipal();
            email = user.getUsername();
            userId = user.getId();
        }

        String ipAddress = "0.0.0.0";
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = request.getRemoteAddr();
        }

        String details = "Method invoked: " + joinPoint.getSignature().toShortString();
        auditLogService.log(userId, email, action, details, ipAddress);
    }

    private String convertMethodToInterfaceAction(String methodName) {
        switch (methodName) {
            case "createProduct": return "CREATE_PRODUCT";
            case "updateProduct": return "UPDATE_PRODUCT";
            case "deleteProduct": return "DELETE_PRODUCT";
            case "adjustStock": return "STOCK_ADJUSTMENT";
            case "transferStock": return "STOCK_TRANSFER";
            default: return "ADMIN_ACTION";
        }
    }
}
