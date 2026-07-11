package com.cogent.dto;

import com.cogent.model.Refund.RefundReason;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RefundDTO {

    // ১. Initiate Request
    public static class InitiateRequest {
        private Long bookingId;
        private RefundReason reason;
        private String notes;

        public Long getBookingId()            { return bookingId; }
        public void setBookingId(Long v)      { this.bookingId = v; }
        public RefundReason getReason()       { return reason; }
        public void setReason(RefundReason v) { this.reason = v; }
        public String getNotes()              { return notes; }
        public void setNotes(String v)        { this.notes = v; }
    }

    // ২. Action Request (Approve/Reject)
    public static class ActionRequest {
        private String note;
        public String getNote()        { return note; }
        public void setNote(String v)  { this.note = v; }
    }

    // ৩. Stats Response
    public static class StatsResponse {
        private long pendingCount;
        private long approvedCount;
        private long processedCount;
        private long rejectedCount;
        private Double totalRefunded;
        private Double totalPenalty;

        public long getPendingCount()                  { return pendingCount; }
        public void setPendingCount(long v)            { this.pendingCount = v; }
        public long getApprovedCount()                 { return approvedCount; }
        public void setApprovedCount(long v)           { this.approvedCount = v; }
        public long getProcessedCount()                { return processedCount; }
        public void setProcessedCount(long v)          { this.processedCount = v; }
        public long getRejectedCount()                 { return rejectedCount; }
        public void setRejectedCount(long v)           { this.rejectedCount = v; }
        public Double getTotalRefunded()               { return totalRefunded; }
        public void setTotalRefunded(Double v)         { this.totalRefunded = v; }
        public Double getTotalPenalty()                { return totalPenalty; }
        public void setTotalPenalty(Double v)          { this.totalPenalty = v; }
    }

    // ৪. Penalty Preview (NEW - এটি ভেতরে রাখতে হবে)
    public static class PenaltyPreview {
        private Long bookingId;
        private String bookingReference;
        private String passengerName;
        private String flightNumber;
        private String flightRoute;
        private Double originalAmount;
        private Double penaltyPercentage;
        private Double penaltyAmount;
        private Double refundAmount;
        private String penaltyReason;

        // Getters and Setters
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long v) { this.bookingId = v; }
        public String getBookingReference() { return bookingReference; }
        public void setBookingReference(String v) { this.bookingReference = v; }
        public String getPassengerName() { return passengerName; }
        public void setPassengerName(String v) { this.passengerName = v; }
        public String getFlightNumber() { return flightNumber; }
        public void setFlightNumber(String v) { this.flightNumber = v; }
        public String getFlightRoute() { return flightRoute; }
        public void setFlightRoute(String v) { this.flightRoute = v; }
        public Double getOriginalAmount() { return originalAmount; }
        public void setOriginalAmount(Double v) { this.originalAmount = v; }
        public Double getPenaltyPercentage() { return penaltyPercentage; }
        public void setPenaltyPercentage(Double v) { this.penaltyPercentage = v; }
        public Double getPenaltyAmount() { return penaltyAmount; }
        public void setPenaltyAmount(Double v) { this.penaltyAmount = v; }
        public Double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(Double v) { this.refundAmount = v; }
        public String getPenaltyReason() { return penaltyReason; }
        public void setPenaltyReason(String v) { this.penaltyReason = v; }
    }
}