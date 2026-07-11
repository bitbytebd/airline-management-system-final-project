package com.cogent.dto;

// ═══════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/cogent/dto/LoyaltyDTO.java
// ═══════════════════════════════════════════════════════════════════

import com.cogent.model.LoyaltyAccount.LoyaltyTier;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoyaltyDTO {

    // ── POST /api/loyalty/enroll ─────────────────────────────────
    public static class EnrollRequest {
        private Long   passengerId;   // links to Passenger.id
        private String passengerName; // Passenger.firstName + lastName
        private String passengerEmail;
        private String passportNumber;
        private String phoneNumber;

        public Long   getPassengerId()              { return passengerId; }
        public void   setPassengerId(Long v)        { this.passengerId = v; }
        public String getPassengerName()            { return passengerName; }
        public void   setPassengerName(String v)    { this.passengerName = v; }
        public String getPassengerEmail()           { return passengerEmail; }
        public void   setPassengerEmail(String v)   { this.passengerEmail = v; }
        public String getPassportNumber()           { return passportNumber; }
        public void   setPassportNumber(String v)   { this.passportNumber = v; }
        public String getPhoneNumber()              { return phoneNumber; }
        public void   setPhoneNumber(String v)      { this.phoneNumber = v; }
    }

    // ── POST /api/loyalty/{accountId}/award ──────────────────────
    // Called after a confirmed booking to award points
    public static class AwardRequest {
        private Long   bookingId;
        private String bookingReference;
        private String flightNumber;
        private String origin;
        private String destination;
        private String classType;      // ECONOMY | PREMIUM | BUSINESS | FIRST_CLASS
        private Double distanceKm;     // Booking.totalDistance
        private String description;    // optional custom note
        private String awardedBy;

        public Long   getBookingId()              { return bookingId; }
        public void   setBookingId(Long v)        { this.bookingId = v; }
        public String getBookingReference()       { return bookingReference; }
        public void   setBookingReference(String v){ this.bookingReference = v; }
        public String getFlightNumber()           { return flightNumber; }
        public void   setFlightNumber(String v)   { this.flightNumber = v; }
        public String getOrigin()                 { return origin; }
        public void   setOrigin(String v)         { this.origin = v; }
        public String getDestination()            { return destination; }
        public void   setDestination(String v)    { this.destination = v; }
        public String getClassType()              { return classType; }
        public void   setClassType(String v)      { this.classType = v; }
        public Double getDistanceKm()             { return distanceKm; }
        public void   setDistanceKm(Double v)     { this.distanceKm = v; }
        public String getDescription()            { return description; }
        public void   setDescription(String v)    { this.description = v; }
        public String getAwardedBy()              { return awardedBy; }
        public void   setAwardedBy(String v)      { this.awardedBy = v; }
    }

    // ── POST /api/loyalty/{accountId}/redeem ─────────────────────
    public static class RedeemRequest {
        private Integer pointsToRedeem;  // must be multiple of 100
        private String  bookingReference; // optional — link to booking
        private String  redeemedBy;

        public Integer getPointsToRedeem()          { return pointsToRedeem; }
        public void    setPointsToRedeem(Integer v) { this.pointsToRedeem = v; }
        public String  getBookingReference()        { return bookingReference; }
        public void    setBookingReference(String v){ this.bookingReference = v; }
        public String  getRedeemedBy()              { return redeemedBy; }
        public void    setRedeemedBy(String v)      { this.redeemedBy = v; }
    }

    // ── POST /api/loyalty/{accountId}/bonus ──────────────────────
    public static class BonusRequest {
        private Integer bonusPoints;
        private String  reason;
        private String  awardedBy;

        public Integer getBonusPoints()          { return bonusPoints; }
        public void    setBonusPoints(Integer v) { this.bonusPoints = v; }
        public String  getReason()               { return reason; }
        public void    setReason(String v)       { this.reason = v; }
        public String  getAwardedBy()            { return awardedBy; }
        public void    setAwardedBy(String v)    { this.awardedBy = v; }
    }

    // ── GET /api/loyalty/stats ───────────────────────────────────
    public static class LoyaltyStats {
        private long   totalMembers;
        private long   bronzeCount;
        private long   silverCount;
        private long   goldCount;
        private long   platinumCount;
        private Long   totalPointsEverIssued;
        private Long   totalPointsRedeemed;
        private Long   totalAvailablePoints;
        // Monetary equivalents (100 pts = 1 BDT)
        private Double totalRedeemedValueBDT;

        public long   getTotalMembers()                 { return totalMembers; }
        public void   setTotalMembers(long v)           { this.totalMembers = v; }
        public long   getBronzeCount()                  { return bronzeCount; }
        public void   setBronzeCount(long v)            { this.bronzeCount = v; }
        public long   getSilverCount()                  { return silverCount; }
        public void   setSilverCount(long v)            { this.silverCount = v; }
        public long   getGoldCount()                    { return goldCount; }
        public void   setGoldCount(long v)              { this.goldCount = v; }
        public long   getPlatinumCount()                { return platinumCount; }
        public void   setPlatinumCount(long v)          { this.platinumCount = v; }
        public Long   getTotalPointsEverIssued()        { return totalPointsEverIssued; }
        public void   setTotalPointsEverIssued(Long v)  { this.totalPointsEverIssued = v; }
        public Long   getTotalPointsRedeemed()          { return totalPointsRedeemed; }
        public void   setTotalPointsRedeemed(Long v)    { this.totalPointsRedeemed = v; }
        public Long   getTotalAvailablePoints()         { return totalAvailablePoints; }
        public void   setTotalAvailablePoints(Long v)   { this.totalAvailablePoints = v; }
        public Double getTotalRedeemedValueBDT()        { return totalRedeemedValueBDT; }
        public void   setTotalRedeemedValueBDT(Double v){ this.totalRedeemedValueBDT = v; }
    }

    // ── Redemption Preview ───────────────────────────────────────
    public static class RedemptionPreview {
        private Integer pointsToRedeem;
        private Integer availablePoints;
        private Double  discountValueBDT;   // pointsToRedeem / 100
        private Integer remainingPoints;

        public Integer getPointsToRedeem()            { return pointsToRedeem; }
        public void    setPointsToRedeem(Integer v)   { this.pointsToRedeem = v; }
        public Integer getAvailablePoints()           { return availablePoints; }
        public void    setAvailablePoints(Integer v)  { this.availablePoints = v; }
        public Double  getDiscountValueBDT()          { return discountValueBDT; }
        public void    setDiscountValueBDT(Double v)  { this.discountValueBDT = v; }
        public Integer getRemainingPoints()           { return remainingPoints; }
        public void    setRemainingPoints(Integer v)  { this.remainingPoints = v; }
    }
}