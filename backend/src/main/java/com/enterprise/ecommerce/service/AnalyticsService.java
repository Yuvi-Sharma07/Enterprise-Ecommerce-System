package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.OrderStatus;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardKPIs() {
        Map<String, Object> kpis = new HashMap<>();

        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        kpis.put("revenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        kpis.put("totalOrders", orderRepository.count());
        kpis.put("activeUsers", userRepository.count());
        kpis.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING));

        double stockValue = inventoryRepository.findAll().stream()
                .mapToDouble(i -> i.getProduct().getPrice().doubleValue() * i.getCurrentStock())
                .sum();
        kpis.put("inventoryValue", BigDecimal.valueOf(stockValue));

        kpis.put("lowStockCount", inventoryRepository.findLowStockProducts().size());

        List<Map<String, Object>> bestSellers = orderRepository.getBestSellingProducts(5);
        kpis.put("bestSellers", bestSellers);

        List<Map<String, Object>> monthlySales = orderRepository.getMonthlySalesData();
        kpis.put("monthlySales", monthlySales);

        return kpis;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSalesForecast() {
        List<Map<String, Object>> salesData = orderRepository.getMonthlySalesData();
        List<Map<String, Object>> forecast = new ArrayList<>();

        if (salesData.size() < 2) {
            double average = salesData.stream()
                    .mapToDouble(m -> {
                        Object val = m.get("sales");
                        return val instanceof BigDecimal ? ((BigDecimal) val).doubleValue() : ((Number) val).doubleValue();
                    })
                    .average()
                    .orElse(5000.0);

            for (int i = 1; i <= 3; i++) {
                Map<String, Object> f = new HashMap<>();
                f.put("month", "Month +" + i);
                f.put("forecastedSales", BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP));
                forecast.add(f);
            }
            return forecast;
        }

        int n = salesData.size();
        double sumX = 0;
        double sumY = 0;
        double sumXY = 0;
        double sumXX = 0;

        List<Map<String, Object>> chronoSales = new ArrayList<>(salesData);
        Collections.reverse(chronoSales);

        for (int i = 0; i < n; i++) {
            double x = i + 1;
            Object val = chronoSales.get(i).get("sales");
            double y = val instanceof BigDecimal ? ((BigDecimal) val).doubleValue() : ((Number) val).doubleValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        double xMean = sumX / n;
        double yMean = sumY / n;

        double slope = (sumXY - n * xMean * yMean) / (sumXX - n * xMean * xMean);
        double intercept = yMean - slope * xMean;

        for (int i = 1; i <= 3; i++) {
            double nextX = n + i;
            double nextY = slope * nextX + intercept;
            nextY = Math.max(0, nextY);

            Map<String, Object> f = new HashMap<>();
            f.put("month", "Month +" + i);
            f.put("forecastedSales", BigDecimal.valueOf(nextY).setScale(2, RoundingMode.HALF_UP));
            forecast.add(f);
        }

        return forecast;
    }
}
