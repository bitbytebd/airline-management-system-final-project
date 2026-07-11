package com.cogent.model;

// ═══════════════════════════════════════════════════════════════════
// FILE  : src/main/java/com/cogent/model/LoyaltyAccount.java
// TABLE : loyalty_accounts  (JPA auto-creates — ddl-auto=update)
// ═══════════════════════════════════════════════════════════════════

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_accounts",
       indexes = {
           @Index(name = "idx_la_passenger_id",    columnList = "passenger_id"),
           @Index(name = "idx_la_member_number",   columnList = "member_number"),
           @Index(name = "idx_la_tier",            columnList = "tier")
       })
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Member Identity ──────────────────────────────────────────
    @Column(name = "member_number", unique = true, length = 20, nullable = false)
    private String memberNumber;               // e.g. SKY-00001234

    // ── Passenger Link (matches Passenger.id) ────────────────────
    @Column(name = "passenger_id", nullable = false, unique = true)
    private Long passengerId;

    @Column(name = "passenger_name", length = 150, nullable = false)
    private String passengerName;              // firstName + " " + lastName

    @Column(name = "passenger_email", length = 150)
    private String passengerEmail;             // Passenger.email

    @Column(name = "passport_number", length = 30)
    private String passportNumber;             // Passenger.passportNumber

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;                // Passenger.phoneNumber

    // ── Points ───────────────────────────────────────────────────
    @Column(name = "total_points_earned")
    private Integer totalPointsEarned = 0;     // Lifetime points earned

    @Column(name = "total_points_redeemed")
    private Integer totalPointsRedeemed = 0;   // Lifetime points redeemed

    @Column(name = "available_points")
    private Integer availablePoints = 0;       // = earned - redeemed - expired

    @Column(name = "expiring_points")
    private Integer expiringPoints = 0;        // Points expiring within 30 days

    @Column(name = "points_expiry_date")
    private LocalDateTime pointsExpiryDate;

    // ── Tier ─────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "tier", length = 20, nullable = false)
    private LoyaltyTier tier = LoyaltyTier.BRONZE;

    @Column(name = "tier_qualifying_points")
    private Integer tierQualifyingPoints = 0;  // Points for tier calculation (12-month rolling)

    @Column(name = "tier_expiry_date")
    private LocalDateTime tierExpiryDate;

    // ── Activity ─────────────────────────────────────────────────
    @Column(name = "total_flights_taken")
    private Integer totalFlightsTaken = 0;

    @Column(name = "total_miles_flown")
    private Double totalMilesFlown = 0.0;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @Column(name = "last_flight_number", length = 20)
    private String lastFlightNumber;

    // ── Account Status ───────────────────────────────────────────
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "enrolled_date", nullable = false)
    private LocalDateTime enrolledDate = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ── Tier Enum ────────────────────────────────────────────────
    public enum LoyaltyTier {
        BRONZE,    // 0–999 qualifying pts
        SILVER,    // 1,000–4,999 qualifying pts
        GOLD,      // 5,000–9,999 qualifying pts
        PLATINUM   // 10,000+ qualifying pts
    }

    // ── Tier Thresholds (class constants) ────────────────────────
    public static final int SILVER_THRESHOLD   = 1_000;
    public static final int GOLD_THRESHOLD     = 5_000;
    public static final int PLATINUM_THRESHOLD = 10_000;

    // ── Tier Multipliers (for point earning) ─────────────────────
    public static double getTierMultiplier(LoyaltyTier tier) {
        return switch (tier) {
            case SILVER   -> 1.25;
            case GOLD     -> 1.50;
            case PLATINUM -> 2.00;
            default       -> 1.00;
        };
    }

    // ── Recalculate tier from qualifying points ───────────────────
    public void recalculateTier() {
        if (this.tierQualifyingPoints >= PLATINUM_THRESHOLD)
            this.tier = LoyaltyTier.PLATINUM;
        else if (this.tierQualifyingPoints >= GOLD_THRESHOLD)
            this.tier = LoyaltyTier.GOLD;
        else if (this.tierQualifyingPoints >= SILVER_THRESHOLD)
            this.tier = LoyaltyTier.SILVER;
        else
            this.tier = LoyaltyTier.BRONZE;
    }

    // ── Points needed to reach next tier ─────────────────────────
    public int pointsToNextTier() {
        return switch (this.tier) {
            case BRONZE   -> SILVER_THRESHOLD   - this.tierQualifyingPoints;
            case SILVER   -> GOLD_THRESHOLD     - this.tierQualifyingPoints;
            case GOLD     -> PLATINUM_THRESHOLD - this.tierQualifyingPoints;
            case PLATINUM -> 0;
        };
    }

    public LoyaltyAccount() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                                  { return id; }
    public void setId(Long id)                           { this.id = id; }
    public String getMemberNumber()                      { return memberNumber; }
    public void setMemberNumber(String v)                { this.memberNumber = v; }
    public Long getPassengerId()                         { return passengerId; }
    public void setPassengerId(Long v)                   { this.passengerId = v; }
    public String getPassengerName()                     { return passengerName; }
    public void setPassengerName(String v)               { this.passengerName = v; }
    public String getPassengerEmail()                    { return passengerEmail; }
    public void setPassengerEmail(String v)              { this.passengerEmail = v; }
    public String getPassportNumber()                    { return passportNumber; }
    public void setPassportNumber(String v)              { this.passportNumber = v; }
    public String getPhoneNumber()                       { return phoneNumber; }
    public void setPhoneNumber(String v)                 { this.phoneNumber = v; }
    public Integer getTotalPointsEarned()                { return totalPointsEarned; }
    public void setTotalPointsEarned(Integer v)          { this.totalPointsEarned = v; }
    public Integer getTotalPointsRedeemed()              { return totalPointsRedeemed; }
    public void setTotalPointsRedeemed(Integer v)        { this.totalPointsRedeemed = v; }
    public Integer getAvailablePoints()                  { return availablePoints; }
    public void setAvailablePoints(Integer v)            { this.availablePoints = v; }
    public Integer getExpiringPoints()                   { return expiringPoints; }
    public void setExpiringPoints(Integer v)             { this.expiringPoints = v; }
    public LocalDateTime getPointsExpiryDate()           { return pointsExpiryDate; }
    public void setPointsExpiryDate(LocalDateTime v)     { this.pointsExpiryDate = v; }
    public LoyaltyTier getTier()                         { return tier; }
    public void setTier(LoyaltyTier v)                   { this.tier = v; }
    public Integer getTierQualifyingPoints()             { return tierQualifyingPoints; }
    public void setTierQualifyingPoints(Integer v)       { this.tierQualifyingPoints = v; }
    public LocalDateTime getTierExpiryDate()             { return tierExpiryDate; }
    public void setTierExpiryDate(LocalDateTime v)       { this.tierExpiryDate = v; }
    public Integer getTotalFlightsTaken()                { return totalFlightsTaken; }
    public void setTotalFlightsTaken(Integer v)          { this.totalFlightsTaken = v; }
    public Double getTotalMilesFlown()                   { return totalMilesFlown; }
    public void setTotalMilesFlown(Double v)             { this.totalMilesFlown = v; }
    public LocalDateTime getLastActivityDate()           { return lastActivityDate; }
    public void setLastActivityDate(LocalDateTime v)     { this.lastActivityDate = v; }
    public String getLastFlightNumber()                  { return lastFlightNumber; }
    public void setLastFlightNumber(String v)            { this.lastFlightNumber = v; }
    public Boolean getIsActive()                         { return isActive; }
    public void setIsActive(Boolean v)                   { this.isActive = v; }
    public LocalDateTime getEnrolledDate()               { return enrolledDate; }
    public void setEnrolledDate(LocalDateTime v)         { this.enrolledDate = v; }
    public LocalDateTime getCreatedAt()                  { return createdAt; }
    public void setCreatedAt(LocalDateTime v)            { this.createdAt = v; }
    public LocalDateTime getUpdatedAt()                  { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v)            { this.updatedAt = v; }
}