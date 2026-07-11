package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    public enum DiscountType { PERCENTAGE, FIXED_AMOUNT }
    public enum CouponStatus { ACTIVE, INACTIVE, EXPIRED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "minimum_booking_amount")
    private Double minimumBookingAmount;

    @Column(name = "maximum_discount_amount")
    private Double maximumDiscountAmount;

    @Column(length = 3)
    private String currency;

    @Column(name = "applicable_route")
    private String applicableRoute;

    @Column(name = "applicable_cabin")
    private String applicableCabin;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount;

    @Enumerated(EnumType.STRING)
    private CouponStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (currency == null || currency.isBlank()) currency = "USD";
        if (status == null) status = CouponStatus.ACTIVE;
        if (usedCount == null) usedCount = 0;
        if (usageLimit == null) usageLimit = 0;
        if (minimumBookingAmount == null) minimumBookingAmount = 0.0;
        if (maximumDiscountAmount == null) maximumDiscountAmount = 0.0;
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }
    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public Double getMinimumBookingAmount() { return minimumBookingAmount; }
    public void setMinimumBookingAmount(Double minimumBookingAmount) { this.minimumBookingAmount = minimumBookingAmount; }
    public Double getMaximumDiscountAmount() { return maximumDiscountAmount; }
    public void setMaximumDiscountAmount(Double maximumDiscountAmount) { this.maximumDiscountAmount = maximumDiscountAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getApplicableRoute() { return applicableRoute; }
    public void setApplicableRoute(String applicableRoute) { this.applicableRoute = applicableRoute; }
    public String getApplicableCabin() { return applicableCabin; }
    public void setApplicableCabin(String applicableCabin) { this.applicableCabin = applicableCabin; }
    public LocalDate getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDate validFrom) { this.validFrom = validFrom; }
    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }
    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }
    public CouponStatus getStatus() { return status; }
    public void setStatus(CouponStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
