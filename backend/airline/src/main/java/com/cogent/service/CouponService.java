package com.cogent.service;

import com.cogent.model.Coupon;
import com.cogent.model.Coupon.CouponStatus;
import com.cogent.model.Coupon.DiscountType;
import com.cogent.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

  @Service(value = "couponService")  //@Service (Marks this class as a Spring Service component)
   @Transactional   //enables database transaction management
  public class CouponService {

	  // injects CouponRepository dependency automatically 
    @Autowired
    private CouponRepository couponRepository;

    //RETRIVES COMPLETE Coupon LIST FROM DB
    public List<Coupon> getAll(String status, String q) {
        if (q != null && !q.isBlank()) return couponRepository.search("%" + q.trim() + "%");
        if (status != null && !status.isBlank()) return couponRepository.findByStatusOrderByValidUntilAsc(CouponStatus.valueOf(status));
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }
    //RETRIVES COMPLETE Coupon LIST FROM DB by id
    public Coupon getById(Long id) {
        return couponRepository.findById(id).orElse(null);
    }

    //save the retrive coupon by id
    public Coupon save(Coupon coupon) {
        normalize(coupon);
        return couponRepository.save(coupon);
    }

    public Coupon update(Long id, Coupon data) {
    	
        Coupon existing = getById(id);
         
        if (existing == null) return null;
        
        existing.setCode(data.getCode());
        existing.setTitle(data.getTitle());
        existing.setDescription(data.getDescription());
        existing.setDiscountType(data.getDiscountType());
        existing.setDiscountValue(data.getDiscountValue());
        existing.setMinimumBookingAmount(data.getMinimumBookingAmount());
        existing.setMaximumDiscountAmount(data.getMaximumDiscountAmount());
        existing.setCurrency(data.getCurrency());
        existing.setApplicableRoute(data.getApplicableRoute());
        existing.setApplicableCabin(data.getApplicableCabin());
        existing.setValidFrom(data.getValidFrom());
        existing.setValidUntil(data.getValidUntil());
        existing.setUsageLimit(data.getUsageLimit());
        existing.setUsedCount(data.getUsedCount());
        existing.setStatus(data.getStatus());
        normalize(existing);
        return couponRepository.save(existing);
    }

    public void delete(Long id) {
    	couponRepository.deleteById(id);
    }

    public Coupon findByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code == null ? "" : code.trim()).orElse(null);
    }

    public void recordRedemption(String code) {
        Coupon coupon = findByCode(code);
        if (coupon == null) return;
        coupon.setUsedCount((coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1);
        couponRepository.save(coupon);
    }

    public Map<String, Object> validate(String code, Double amount, String route, String cabin) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code == null ? "" : code.trim()).orElse(null);
        Map<String, Object> res = new LinkedHashMap<>();
        double bookingAmount = amount == null ? 0 : amount;

        if (coupon == null) return invalid(res, "Coupon code was not found.");
        if (coupon.getStatus() != CouponStatus.ACTIVE) return invalid(res, "Coupon is not active.");
        LocalDate today = LocalDate.now();
        if (coupon.getValidFrom() != null && today.isBefore(coupon.getValidFrom())) return invalid(res, "Coupon is not valid yet.");
        if (coupon.getValidUntil() != null && today.isAfter(coupon.getValidUntil())) return invalid(res, "Coupon has expired.");
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return invalid(res, "Coupon usage limit has been reached.");
        }
        if (bookingAmount < value(coupon.getMinimumBookingAmount())) return invalid(res, "Booking amount is below the coupon minimum.");
        if (!matches(coupon.getApplicableRoute(), route)) return invalid(res, "Coupon is not eligible for this route.");
        if (!matches(coupon.getApplicableCabin(), cabin)) return invalid(res, "Coupon is not eligible for this cabin.");

        double discount = coupon.getDiscountType() == DiscountType.PERCENTAGE
                ? bookingAmount * value(coupon.getDiscountValue()) / 100.0
                : value(coupon.getDiscountValue());
        if (value(coupon.getMaximumDiscountAmount()) > 0) {
            discount = Math.min(discount, coupon.getMaximumDiscountAmount());
        }
        discount = Math.min(discount, bookingAmount);
        res.put("valid", true);
        res.put("message", "Coupon is eligible.");
        res.put("discountAmount", Math.round(discount * 100.0) / 100.0);
        res.put("finalAmount", Math.round((bookingAmount - discount) * 100.0) / 100.0);
        res.put("coupon", coupon);
        return res;
    }

    public Map<String, Object> stats() {
        List<Coupon> all = couponRepository.findAll();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalCoupons", all.size());
        res.put("activeCoupons", all.stream().filter(c -> c.getStatus() == CouponStatus.ACTIVE).count());
        res.put("totalRedemptions", all.stream().mapToInt(c -> c.getUsedCount() == null ? 0 : c.getUsedCount()).sum());
        res.put("expiringSoon", all.stream().filter(c -> c.getValidUntil() != null && !c.getValidUntil().isBefore(LocalDate.now()) && c.getValidUntil().isBefore(LocalDate.now().plusDays(15))).count());
        return res;
    }

    private Map<String, Object> invalid(Map<String, Object> res, String msg) {
        res.put("valid", false);
        res.put("message", msg);
        res.put("discountAmount", 0.0);
        res.put("finalAmount", 0.0);
        return res;
    }

    private boolean matches(String rule, String value) {
        return rule == null || rule.isBlank() || "ALL".equalsIgnoreCase(rule) ||
                (value != null && rule.equalsIgnoreCase(value));
    }

    private double value(Double n) { return n == null ? 0.0 : n; }

    private void normalize(Coupon c) {
        if (c.getCode() != null) c.setCode(c.getCode().trim().toUpperCase());
        if (c.getCurrency() == null || c.getCurrency().isBlank()) c.setCurrency("USD");
        if (c.getStatus() == null) c.setStatus(CouponStatus.ACTIVE);
        if (c.getUsedCount() == null) c.setUsedCount(0);
        if (c.getUsageLimit() == null) c.setUsageLimit(0);
        if (c.getMinimumBookingAmount() == null) c.setMinimumBookingAmount(0.0);
        if (c.getMaximumDiscountAmount() == null) c.setMaximumDiscountAmount(0.0);
    }
}
