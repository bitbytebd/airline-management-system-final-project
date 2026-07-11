package com.cogent.service;

import com.cogent.dao.BookingDAO;
import com.cogent.dao.RefundDAO;
import com.cogent.dto.RefundDTO;
import com.cogent.dto.RefundDTO.InitiateRequest;
import com.cogent.dto.RefundDTO.PenaltyPreview;
import com.cogent.dto.RefundDTO.StatsResponse;
import com.cogent.model.Booking;
import com.cogent.model.Refund;
import com.cogent.model.Refund.RefundReason;
import com.cogent.model.Refund.RefundStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;

@Service(value = "refundService")
@Transactional
public class RefundService {

    @Autowired private RefundDAO  refundDAO;
    @Autowired private BookingDAO bookingDAO;
    @Autowired private EmailNotificationService emailNotificationService;

    // ── IATA Penalty Policy ──────────────────────────────────────
    private static final double P_OVER_72H  = 0.10;   // >72h  → 10%
    private static final double P_24_TO_72H = 0.25;   // 24-72h→ 25%
    private static final double P_UNDER_24H = 0.50;   // <24h  → 50%
    private static final double P_NO_REFUND = 1.00;   // post-dep → 100%

    // ── Read Operations ──────────────────────────────────────────
    public List<Refund> getAll()                            { return refundDAO.getAll(); }
    public Refund       getById(Long id)                    { return refundDAO.getById(id); }
    public List<Refund> getByStatus(String status)          { return refundDAO.getByStatus(RefundStatus.valueOf(status)); }
    public List<Refund> getPending()                        { return refundDAO.getPending(); }
    public List<Refund> getByBookingId(Long bid)            { return refundDAO.getByBookingId(bid); }
    public List<Refund> search(String keyword)              { return refundDAO.search(keyword); }

    // ── CALCULATE PREVIEW (Renamed from previewPenalty to match Controller) ────────────────────────
    public PenaltyPreview calculatePreview(Long bookingId, String reasonStr) {
        Booking b = bookingDAO.getById(bookingId);
        if (b == null) throw new RuntimeException("Booking not found: " + bookingId);

        RefundReason reason  = RefundReason.valueOf(reasonStr);
        double       pct     = computePenaltyPct(reason, b.getDepartureDate()); // Using Correct Logic
        double       orig    = b.getTotalPrice() != null ? b.getTotalPrice() : 0.0;
        double       penAmt  = round2(orig * pct);
        double       refAmt  = round2(Math.max(orig - penAmt, 0.0));

        PenaltyPreview prev = new PenaltyPreview();
        prev.setBookingId(bookingId);
        prev.setBookingReference(b.getBookingReference());
        prev.setPassengerName(b.getPassengerName());
        prev.setFlightNumber(b.getFlightNumber());
        prev.setFlightRoute(b.getOrigin() + " → " + b.getDestination());
        prev.setOriginalAmount(orig);
        prev.setPenaltyPercentage(pct * 100);
        prev.setPenaltyAmount(penAmt);
        prev.setRefundAmount(refAmt);
        prev.setPenaltyReason(buildPenaltyReason(reason, b.getDepartureDate()));
        return prev;
    }

    // ── Initiate Refund ──────────────────────────────────────────
    @Transactional
    public Refund initiateRefund(Long bookingId, RefundReason reason, String notes) {
        Booking b = bookingDAO.getById(bookingId);
        if (b == null)
            throw new RuntimeException("Booking not found: " + bookingId);
        if (refundDAO.existsForBooking(bookingId))
            throw new RuntimeException("A refund request already exists for booking: " + b.getBookingReference());

        double pct    = computePenaltyPct(reason, b.getDepartureDate());
        double orig   = b.getTotalPrice() != null ? b.getTotalPrice() : 0.0;
        double penAmt = round2(orig * pct);
        double refAmt = round2(Math.max(orig - penAmt, 0.0));

        Refund r = new Refund();
        r.setRefundReference("RFD-" + generateRef());
        r.setBookingId(bookingId);
        r.setBookingReference(b.getBookingReference());
        r.setPassengerId(b.getPassengerId());
        r.setPassengerName(b.getPassengerName());
        r.setPassengerEmail(b.getEmail());
        r.setFlightNumber(b.getFlightNumber());
        r.setFlightRoute(b.getOrigin() + " → " + b.getDestination());
        r.setDepartureDate(b.getDepartureDate());
        r.setClassType(b.getClassType());
        r.setOriginalAmount(orig);
        r.setPenaltyPercentage(pct * 100);
        r.setPenaltyAmount(penAmt);
        r.setRefundAmount(refAmt);
        r.setPaymentMethod(b.getPaymentMethod());
        r.setRefundReason(reason);
        r.setReasonNotes(notes);
        r.setStatus(RefundStatus.PENDING);
        r.setRequestedAt(LocalDateTime.now());

        // Cancel the booking
        b.setStatus("CANCELLED");
        bookingDAO.update(b);

        Refund saved = refundDAO.save(r);
        emailNotificationService.sendRefundStatusEmail(saved);
        return saved;
    }

    // ── Workflow Actions ─────────────────────────────────────────
    @Transactional
    public Refund approve(Long id, String by) {
        Refund r = require(id);
        if (r.getStatus() != RefundStatus.PENDING)
            throw new RuntimeException("Only PENDING refunds can be approved.");
        r.setStatus(RefundStatus.APPROVED);
        r.setProcessedAt(LocalDateTime.now());
        r.setProcessedBy(by);
        Refund updated = refundDAO.update(r);
        emailNotificationService.sendRefundStatusEmail(updated);
        return updated;
    }

    @Transactional
    public Refund process(Long id, String by) {
        Refund r = require(id);
        if (r.getStatus() != RefundStatus.APPROVED)
            throw new RuntimeException("Only APPROVED refunds can be processed.");
        r.setStatus(RefundStatus.PROCESSED);
        r.setProcessedAt(LocalDateTime.now());
        r.setProcessedBy(by);
        Refund updated = refundDAO.update(r);
        emailNotificationService.sendRefundStatusEmail(updated);
        return updated;
    }

    @Transactional
    public Refund reject(Long id, String by) {
        Refund r = require(id);
        if (r.getStatus() == RefundStatus.PROCESSED)
            throw new RuntimeException("Cannot reject an already processed refund.");
        r.setStatus(RefundStatus.REJECTED);
        r.setProcessedAt(LocalDateTime.now());
        r.setProcessedBy(by);
        Refund updated = refundDAO.update(r);
        emailNotificationService.sendRefundStatusEmail(updated);
        return updated;
    }

    // ── Stats ────────────────────────────────────────────────────
    public StatsResponse getStats() {
        StatsResponse s = new StatsResponse();
        s.setPendingCount(refundDAO.countByStatus(RefundStatus.PENDING));
        s.setApprovedCount(refundDAO.countByStatus(RefundStatus.APPROVED));
        s.setProcessedCount(refundDAO.countByStatus(RefundStatus.PROCESSED));
        s.setRejectedCount(refundDAO.countByStatus(RefundStatus.REJECTED));
        s.setTotalRefunded(refundDAO.getTotalRefunded());
        s.setTotalPenalty(refundDAO.getTotalPenalty());
        return s;
    }

    // ── Helpers ──────────────────────────────────────────────────
    private double computePenaltyPct(RefundReason reason, LocalDate departure) {
        if (isAirlineFault(reason)) return 0.0;
        if (departure == null)      return P_NO_REFUND;
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), departure.atStartOfDay());
        if (hours < 0)   return P_NO_REFUND;
        if (hours < 24)  return P_UNDER_24H;
        if (hours <= 72) return P_24_TO_72H;
        return P_OVER_72H;
    }

    private boolean isAirlineFault(RefundReason r) {
        return r == RefundReason.FLIGHT_CANCEL || r == RefundReason.FLIGHT_DELAY
            || r == RefundReason.OVERBOOKING   || r == RefundReason.WEATHER;
    }

    private String buildPenaltyReason(RefundReason reason, LocalDate departure) {
        if (isAirlineFault(reason))
            return "Airline fault — full refund, no penalty applies.";
        if (departure == null) return "No departure date — no refund applicable.";
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), departure.atStartOfDay());
        if (hours < 0)   return "Flight already departed — no refund applicable.";
        if (hours < 24)  return "Less than 24 hrs to departure — 50% penalty.";
        if (hours <= 72) return "24-72 hrs to departure — 25% penalty.";
        return "More than 72 hrs to departure — 10% penalty.";
    }

    private Refund require(Long id) {
        Refund r = refundDAO.getById(id);
        if (r == null) throw new RuntimeException("Refund not found: " + id);
        return r;
    }

    private String generateRef() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
        Random rnd   = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
