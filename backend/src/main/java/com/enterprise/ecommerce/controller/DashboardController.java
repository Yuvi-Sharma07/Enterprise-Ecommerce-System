package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER')")
public class DashboardController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        return ResponseEntity.ok(analyticsService.getDashboardKPIs());
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<Map<String, Object>>> getForecast() {
        return ResponseEntity.ok(analyticsService.getSalesForecast());
    }
}
