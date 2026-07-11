package com.cogent.dto;
 
import com.cogent.model.Payment.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;
 
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentDTO {
 
    /** POST /api/payments/process */
    public static class ProcessRequest {
        private Long          bookingId;
        private PaymentMethod paymentMethod;
        private String        gatewayName;
        private String        cardLastFour;
        private String        cardBrand;
        private String        mobileNumber;
        private String        bankName;
        private String        couponCode;
        private Integer       loyaltyPointsToUse;
        private String        notes;
        private String        processedBy;
 
        public Long          getBookingId()                  { return bookingId; }
        public void          setBookingId(Long v)            { this.bookingId = v; }
        public PaymentMethod getPaymentMethod()              { return paymentMethod; }
        public void          setPaymentMethod(PaymentMethod v){ this.paymentMethod = v; }
        public String        getGatewayName()                { return gatewayName; }
        public void          setGatewayName(String v)        { this.gatewayName = v; }
        public String        getCardLastFour()               { return cardLastFour; }
        public void          setCardLastFour(String v)       { this.cardLastFour = v; }
        public String        getCardBrand()                  { return cardBrand; }
        public void          setCardBrand(String v)          { this.cardBrand = v; }
        public String        getMobileNumber()               { return mobileNumber; }
        public void          setMobileNumber(String v)       { this.mobileNumber = v; }
        public String        getBankName()                   { return bankName; }
        public void          setBankName(String v)           { this.bankName = v; }
        public String        getCouponCode()                 { return couponCode; }
        public void          setCouponCode(String v)         { this.couponCode = v; }
        public Integer       getLoyaltyPointsToUse()         { return loyaltyPointsToUse; }
        public void          setLoyaltyPointsToUse(Integer v){ this.loyaltyPointsToUse = v; }
        public String        getNotes()                      { return notes; }
        public void          setNotes(String v)              { this.notes = v; }
        public String        getProcessedBy()                { return processedBy; }
        public void          setProcessedBy(String v)        { this.processedBy = v; }
    }

    /** POST /api/payments/process-expense/{expenseId} */
    public static class ProcessExpenseRequest {
        private PaymentMethod paymentMethod;
        private Double        paidAmount;
        private String        transactionReference;
        private String        notes;
        private String        processedBy;

        public PaymentMethod getPaymentMethod()                 { return paymentMethod; }
        public void          setPaymentMethod(PaymentMethod v)  { this.paymentMethod = v; }
        public Double        getPaidAmount()                    { return paidAmount; }
        public void          setPaidAmount(Double v)            { this.paidAmount = v; }
        public String        getTransactionReference()          { return transactionReference; }
        public void          setTransactionReference(String v)  { this.transactionReference = v; }
        public String        getNotes()                         { return notes; }
        public void          setNotes(String v)                 { this.notes = v; }
        public String        getProcessedBy()                   { return processedBy; }
        public void          setProcessedBy(String v)           { this.processedBy = v; }
    }
 
    /** GET /api/payments/stats */
    public static class PaymentStats {
        private Double totalRevenue;
        private Double monthlyRevenue;
        private Double dailyRevenue;
        private long   completedCount;
        private long   pendingCount;
        private long   failedCount;
        private long   refundedCount;
        private long   totalCount;
 
        public Double getTotalRevenue()              { return totalRevenue; }
        public void   setTotalRevenue(Double v)      { this.totalRevenue = v; }
        public Double getMonthlyRevenue()            { return monthlyRevenue; }
        public void   setMonthlyRevenue(Double v)    { this.monthlyRevenue = v; }
        public Double getDailyRevenue()              { return dailyRevenue; }
        public void   setDailyRevenue(Double v)      { this.dailyRevenue = v; }
        public long   getCompletedCount()            { return completedCount; }
        public void   setCompletedCount(long v)      { this.completedCount = v; }
        public long   getPendingCount()              { return pendingCount; }
        public void   setPendingCount(long v)        { this.pendingCount = v; }
        public long   getFailedCount()               { return failedCount; }
        public void   setFailedCount(long v)         { this.failedCount = v; }
        public long   getRefundedCount()             { return refundedCount; }
        public void   setRefundedCount(long v)       { this.refundedCount = v; }
        public long   getTotalCount()                { return totalCount; }
        public void   setTotalCount(long v)          { this.totalCount = v; }
    }
}
 
