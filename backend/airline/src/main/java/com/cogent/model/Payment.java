package com.cogent.model;

// ═══════════════════════════════════════════════════════════════════
// FILE  : src/main/java/com/cogent/model/Payment.java
// TABLE : payments  (JPA ddl-auto=update creates this automatically)
// ═══════════════════════════════════════════════════════════════════

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments",
       indexes = {
           @Index(name = "idx_pay_booking_id",     columnList = "booking_id"),
           @Index(name = "idx_pay_expense_id",     columnList = "expense_id"),
           @Index(name = "idx_pay_purpose",        columnList = "payment_purpose"),
           @Index(name = "idx_pay_status",          columnList = "status"),
           @Index(name = "idx_pay_method",          columnList = "payment_method"),
           @Index(name = "idx_pay_transaction_ref", columnList = "transaction_reference"),
           @Index(name = "idx_pay_created_at",      columnList = "created_at")
       })
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Internal Reference ────────────────────────────────────────
    @Column(name = "payment_reference", unique = true, nullable = false, length = 25)
    private String paymentReference;          // e.g. PAY-20250510-ABCD

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_purpose", length = 30)
    private PaymentPurpose paymentPurpose = PaymentPurpose.BOOKING_PAYMENT;

    // ── Booking Link ──────────────────────────────────────────────
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_reference", length = 25)
    private String bookingReference;

    @Column(name = "expense_id")
    private Long expenseId;

    @Column(name = "expense_reference", length = 50)
    private String expenseReference;

    // ── Passenger Snapshot ────────────────────────────────────────
    @Column(name = "passenger_id")
    private Long passengerId;

    @Column(name = "passenger_name", length = 150)
    private String passengerName;

    @Column(name = "passenger_email", length = 150)
    private String passengerEmail;

    // ── Flight Snapshot ───────────────────────────────────────────
    @Column(name = "flight_number", length = 20)
    private String flightNumber;

    @Column(name = "flight_route", length = 120)
    private String flightRoute;               // "Dhaka → Dubai"

    // ── Amount Breakdown ─────────────────────────────────────────
    @Column(name = "base_fare", nullable = false)
    private Double baseFare      = 0.0;

    @Column(name = "tax_amount")
    private Double taxAmount     = 0.0;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "loyalty_discount")
    private Double loyaltyDiscount = 0.0;     // from points redemption

    @Column(name = "coupon_discount")
    private Double couponDiscount = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount   = 0.0;       // final charged amount

    @Column(name = "amount")
    private Double amount = 0.0;

    @Column(name = "currency", length = 5)
    private String currency = "BDT";

    // ── Payment Method ────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 25)
    private PaymentMethod paymentMethod;

    // Gateway / mobile banking details
    @Column(name = "gateway_name", length = 50)
    private String gatewayName;               // e.g. "Stripe", "bKash", "Nagad"

    @Column(name = "card_last_four", length = 4)
    private String cardLastFour;

    @Column(name = "card_brand", length = 20)
    private String cardBrand;                 // VISA, Mastercard, AMEX

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;              // For bKash / Nagad

    @Column(name = "bank_name", length = 80)
    private String bankName;

    @Column(name = "account_number", length = 30)
    private String accountNumber;

    // ── Gateway Response ──────────────────────────────────────────
    @Column(name = "transaction_reference", unique = true, length = 60)
    private String transactionReference;      // Gateway transaction ID

    @Column(name = "gateway_response_code", length = 10)
    private String gatewayResponseCode;       // "00" = success

    @Column(name = "gateway_message", length = 200)
    private String gatewayMessage;

    // ── Status ────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_status", length = 25)
    private String paymentStatus = PaymentStatus.PENDING.name();

    @Column(name = "failure_reason", length = 300)
    private String failureReason;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    // ── Coupon / Loyalty ──────────────────────────────────────────
    @Column(name = "coupon_code", length = 30)
    private String couponCode;

    @Column(name = "loyalty_points_used")
    private Integer loyaltyPointsUsed = 0;

    // ── Audit ─────────────────────────────────────────────────────
    @Column(name = "initiated_at")
    private LocalDateTime initiatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", length = 80)
    private String createdBy;

    @Column(name = "notes", length = 400)
    private String notes;

    // ── Enums ─────────────────────────────────────────────────────
    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        BANK_TRANSFER,
        BKASH,
        NAGAD,
        ROCKET,
        CASH,
        LOYALTY_POINTS,
        ONLINE_PAYMENT
    }

    public enum PaymentStatus {
        PENDING,     // Initiated, not yet processed
        PROCESSING,  // Sent to gateway, awaiting response
        COMPLETED,   // Successfully charged
        FAILED,      // Gateway declined / error
        REFUNDED,    // Full or partial refund issued
        CANCELLED,   // Cancelled before processing
        PARTIAL      // Partial payment made
    }

    public enum PaymentPurpose {
        BOOKING_PAYMENT,
        EXPENSE_PAYMENT
    }

    public Payment() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public String getPaymentReference()              { return paymentReference; }
    public void setPaymentReference(String v)        { this.paymentReference = v; }
    public PaymentPurpose getPaymentPurpose()         { return paymentPurpose; }
    public void setPaymentPurpose(PaymentPurpose v)   { this.paymentPurpose = v; }
    public Long getBookingId()                       { return bookingId; }
    public void setBookingId(Long v)                 { this.bookingId = v; }
    public String getBookingReference()              { return bookingReference; }
    public void setBookingReference(String v)        { this.bookingReference = v; }
    public Long getExpenseId()                       { return expenseId; }
    public void setExpenseId(Long v)                 { this.expenseId = v; }
    public String getExpenseReference()              { return expenseReference; }
    public void setExpenseReference(String v)        { this.expenseReference = v; }
    public Long getPassengerId()                     { return passengerId; }
    public void setPassengerId(Long v)               { this.passengerId = v; }
    public String getPassengerName()                 { return passengerName; }
    public void setPassengerName(String v)           { this.passengerName = v; }
    public String getPassengerEmail()                { return passengerEmail; }
    public void setPassengerEmail(String v)          { this.passengerEmail = v; }
    public String getFlightNumber()                  { return flightNumber; }
    public void setFlightNumber(String v)            { this.flightNumber = v; }
    public String getFlightRoute()                   { return flightRoute; }
    public void setFlightRoute(String v)             { this.flightRoute = v; }
    public Double getBaseFare()                      { return baseFare; }
    public void setBaseFare(Double v)                { this.baseFare = v; }
    public Double getTaxAmount()                     { return taxAmount; }
    public void setTaxAmount(Double v)               { this.taxAmount = v; }
    public Double getDiscountAmount()                { return discountAmount; }
    public void setDiscountAmount(Double v)          { this.discountAmount = v; }
    public Double getLoyaltyDiscount()               { return loyaltyDiscount; }
    public void setLoyaltyDiscount(Double v)         { this.loyaltyDiscount = v; }
    public Double getCouponDiscount()                { return couponDiscount; }
    public void setCouponDiscount(Double v)          { this.couponDiscount = v; }
    public Double getTotalAmount()                   { return totalAmount; }
    public void setTotalAmount(Double v)             { this.totalAmount = v; this.amount = v; }
    public Double getAmount()                        { return amount != null ? amount : totalAmount; }
    public void setAmount(Double v)                  { this.amount = v; }
    public String getCurrency()                      { return currency; }
    public void setCurrency(String v)                { this.currency = v; }
    public PaymentMethod getPaymentMethod()          { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod v)    { this.paymentMethod = v; }
    public String getGatewayName()                   { return gatewayName; }
    public void setGatewayName(String v)             { this.gatewayName = v; }
    public String getCardLastFour()                  { return cardLastFour; }
    public void setCardLastFour(String v)            { this.cardLastFour = v; }
    public String getCardBrand()                     { return cardBrand; }
    public void setCardBrand(String v)               { this.cardBrand = v; }
    public String getMobileNumber()                  { return mobileNumber; }
    public void setMobileNumber(String v)            { this.mobileNumber = v; }
    public String getBankName()                      { return bankName; }
    public void setBankName(String v)                { this.bankName = v; }
    public String getAccountNumber()                 { return accountNumber; }
    public void setAccountNumber(String v)           { this.accountNumber = v; }
    public String getTransactionReference()          { return transactionReference; }
    public void setTransactionReference(String v)    { this.transactionReference = v; }
    public String getGatewayResponseCode()           { return gatewayResponseCode; }
    public void setGatewayResponseCode(String v)     { this.gatewayResponseCode = v; }
    public String getGatewayMessage()                { return gatewayMessage; }
    public void setGatewayMessage(String v)          { this.gatewayMessage = v; }
    public PaymentStatus getStatus()                 { return status; }
    public void setStatus(PaymentStatus v)           { this.status = v; this.paymentStatus = v != null ? v.name() : null; }
    public String getPaymentStatus()                 { return paymentStatus != null ? paymentStatus : (status != null ? status.name() : null); }
    public void setPaymentStatus(String v)           { this.paymentStatus = v; }
    public String getFailureReason()                 { return failureReason; }
    public void setFailureReason(String v)           { this.failureReason = v; }
    public Integer getRetryCount()                   { return retryCount; }
    public void setRetryCount(Integer v)             { this.retryCount = v; }
    public String getCouponCode()                    { return couponCode; }
    public void setCouponCode(String v)              { this.couponCode = v; }
    public Integer getLoyaltyPointsUsed()            { return loyaltyPointsUsed; }
    public void setLoyaltyPointsUsed(Integer v)      { this.loyaltyPointsUsed = v; }
    public LocalDateTime getInitiatedAt()            { return initiatedAt; }
    public void setInitiatedAt(LocalDateTime v)      { this.initiatedAt = v; }
    public LocalDateTime getCompletedAt()            { return completedAt; }
    public void setCompletedAt(LocalDateTime v)      { this.completedAt = v; this.paidAt = v; }
    public LocalDateTime getPaidAt()                 { return paidAt != null ? paidAt : completedAt; }
    public void setPaidAt(LocalDateTime v)           { this.paidAt = v; }
    public LocalDateTime getCreatedAt()              { return createdAt; }
    public void setCreatedAt(LocalDateTime v)        { this.createdAt = v; }
    public String getCreatedBy()                     { return createdBy; }
    public void setCreatedBy(String v)               { this.createdBy = v; }
    public String getNotes()                         { return notes; }
    public void setNotes(String v)                   { this.notes = v; }
}
