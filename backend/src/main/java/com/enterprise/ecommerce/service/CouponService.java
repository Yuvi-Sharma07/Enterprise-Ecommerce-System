package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Coupon;
import com.enterprise.ecommerce.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.findByCodeIgnoreCase(coupon.getCode()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists");
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));

        if (!coupon.isValid()) {
            throw new IllegalArgumentException("Coupon is expired, inactive, or has reached its usage limit");
        }

        return coupon;
    }

    @Transactional
    public void incrementCouponUsage(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(coupon -> {
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);
        });
    }
}
