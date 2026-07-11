package com.cogent.service;
 
import com.cogent.dao.BookingDAO;
//import com.cogent.dao.CouponDAO;
import com.cogent.dao.LoyaltyDAO;
import com.cogent.dao.PaymentDAO;
import com.cogent.dto.PaymentDTO.PaymentStats;
import com.cogent.dto.PaymentDTO.ProcessExpenseRequest;
import com.cogent.dto.PaymentDTO.ProcessRequest;
import com.cogent.model.Booking;
import com.cogent.model.Expense;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.Payment;
import com.cogent.model.Payment.PaymentMethod;
import com.cogent.model.Payment.PaymentPurpose;
import com.cogent.model.Payment.PaymentStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
 
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
 
@Service(value = "paymentService")
@Transactional
public class PaymentService {
 
    @Autowired private PaymentDAO  paymentDAO;
    @Autowired private BookingDAO  bookingDAO;
    @Autowired private BookingService bookingService;
    @Autowired private ExpenseService expenseService;
    @Autowired private EmailNotificationService emailNotificationService;
   // @Autowired private CouponDAO   couponDAO;
    @Autowired private LoyaltyDAO  loyaltyDAO;
 
    private static final double TAX_RATE          = 0.05;   // 5% VAT
    private static final int    POINTS_PER_BDT    = 100;    // 100 pts = BDT 1
 
    // ── Reads ─────────────────────────────────────────────────────
    public List<Payment> getAll()                           { return paymentDAO.getAll(); }
    public Payment       getById(Long id)                   { return paymentDAO.getById(id); }
    public List<Payment> getByStatus(String s)              { return paymentDAO.getByStatus(PaymentStatus.valueOf(s)); }
    public List<Payment> getByMethod(String m)              { return paymentDAO.getByMethod(PaymentMethod.valueOf(m)); }
    public List<Payment> getByBookingId(Long bid)           { return paymentDAO.getByBookingId(bid); }
    public List<Payment> getByPassengerId(Long pid)         { return paymentDAO.getByPassengerId(pid); }
    public List<Payment> search(String q)                   { return paymentDAO.search(q); }
    public List<Object[]> getMonthlyStats()                 { return paymentDAO.getMonthlyStats(); }
    public List<Object[]> getMethodBreakdown()              { return paymentDAO.getMethodBreakdown(); }
 
    // ── Process Payment ───────────────────────────────────────────
    @Transactional
    public Payment processPayment(ProcessRequest req) {
        Booking booking = bookingDAO.getById(req.getBookingId());
        if (booking == null)
            throw new RuntimeException("Booking not found: " + req.getBookingId());
        if (paymentDAO.completedExistsForBooking(req.getBookingId()))
            throw new RuntimeException("Payment already completed for booking: " + booking.getBookingReference());
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus()))
            throw new RuntimeException("Booking is already marked as paid: " + booking.getBookingReference());
        if (!"APPROVED_FOR_PAYMENT".equalsIgnoreCase(booking.getStatus()) && !"CONFIRMED".equalsIgnoreCase(booking.getStatus()))
            throw new RuntimeException("Booking must be approved before payment. Current status: " + booking.getStatus());
 
        // ── Build Payment ─────────────────────────────────────────
        Payment p = new Payment();
        p.setPaymentReference(generatePaymentRef());
        p.setPaymentPurpose(PaymentPurpose.BOOKING_PAYMENT);
        p.setBookingId(booking.getId());
        p.setBookingReference(booking.getBookingReference());
        p.setExpenseId(null);
        p.setExpenseReference(null);
        p.setPassengerId(booking.getPassengerId());
        p.setPassengerName(booking.getPassengerName());
        p.setPassengerEmail(booking.getEmail());
        p.setFlightNumber(booking.getFlightNumber());
        p.setFlightRoute(booking.getOrigin() + " → " + booking.getDestination());
        p.setPaymentMethod(req.getPaymentMethod());
        p.setGatewayName(req.getGatewayName());
        p.setCardLastFour(req.getCardLastFour());
        p.setCardBrand(req.getCardBrand());
        p.setMobileNumber(req.getMobileNumber());
        p.setBankName(req.getBankName());
        p.setNotes(req.getNotes());
        p.setCreatedBy(req.getProcessedBy());
        p.setCreatedAt(LocalDateTime.now());
        p.setInitiatedAt(LocalDateTime.now());
 
        // ── Amount Calculation ────────────────────────────────────
        double baseFare = booking.getBaseFare() != null ? booking.getBaseFare() : booking.getTotalPrice();
        double tax      = booking.getTax() != null ? booking.getTax() : round2(baseFare * TAX_RATE);
        double discount = booking.getDiscount() != null ? booking.getDiscount() : 0.0;
        double couponDisc = booking.getCouponDiscount() != null ? booking.getCouponDiscount() : 0.0;
        double bookingLoyaltyDisc = booking.getLoyaltyDiscount() != null ? booking.getLoyaltyDiscount() : 0.0;
        p.setCouponCode(booking.getCouponCode());
        p.setCouponDiscount(couponDisc);
        p.setLoyaltyDiscount(bookingLoyaltyDisc);
        p.setLoyaltyPointsUsed(booking.getLoyaltyPointsUsed() != null ? booking.getLoyaltyPointsUsed() : 0);
 
        // Coupon discount
     //   double couponDisc = 0.0;
       // if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
        //    var coupon = couponDAO.getByCouponCode(req.getCouponCode());
          //  if (coupon != null && coupon.isValid(baseFare)) {
           //     couponDisc = round2(coupon.calculateDiscount(baseFare));
             //   p.setCouponCode(req.getCouponCode());
             //   p.setCouponDiscount(couponDisc);
             //   discount += couponDisc;
             //   couponDAO.incrementUsedCount(coupon.getId());
           // }
      //  }
 
        // Loyalty points discount
        double loyaltyDisc = bookingLoyaltyDisc;
        boolean paymentRedeemedPoints = req.getLoyaltyPointsToUse() != null && req.getLoyaltyPointsToUse() > 0;
        if (paymentRedeemedPoints) {
            LoyaltyAccount la = loyaltyDAO.getAccountByPassengerId(booking.getPassengerId());
            if (la != null && la.getAvailablePoints() >= req.getLoyaltyPointsToUse()) {
                loyaltyDisc = round2((double) req.getLoyaltyPointsToUse() / POINTS_PER_BDT);
                p.setLoyaltyDiscount(loyaltyDisc);
                p.setLoyaltyPointsUsed(req.getLoyaltyPointsToUse());
                discount = round2(discount + loyaltyDisc);
                // Deduct from loyalty account
                la.setTotalPointsRedeemed(la.getTotalPointsRedeemed() + req.getLoyaltyPointsToUse());
                la.setAvailablePoints(la.getAvailablePoints() - req.getLoyaltyPointsToUse());
                la.setUpdatedAt(LocalDateTime.now());
                loyaltyDAO.updateAccount(la);
            }
        }
 
        double total = booking.getTotalPrice() != null ? booking.getTotalPrice() : round2(Math.max(baseFare + tax - discount, 0));
        if (paymentRedeemedPoints) {
            total = round2(Math.max(total - loyaltyDisc, 0));
        }
        p.setBaseFare(baseFare);
        p.setTaxAmount(tax);
        p.setDiscountAmount(discount);
        p.setTotalAmount(total);
        p.setAmount(total);
        p.setCurrency("USD");
        p.setStatus(PaymentStatus.PROCESSING);
 
        Payment saved = paymentDAO.save(p);
 
        // ── Simulate Gateway ──────────────────────────────────────
        return simulateGatewayResponse(saved, booking, paymentRedeemedPoints);
    }

    @Transactional
    public Payment processExpensePayment(Long expenseId, ProcessExpenseRequest req) {
        Expense expense = expenseService.getExpenseById(expenseId);
        if (expense == null)
            throw new RuntimeException("Expense not found: " + expenseId);
        if ("PAID".equalsIgnoreCase(expense.getStatus()))
            throw new RuntimeException("Expense is already paid: " + expenseReference(expense));

        double expenseAmount = expense.getAmount() != null ? expense.getAmount() : 0.0;
        double paidAmount = req.getPaidAmount() != null ? req.getPaidAmount() : 0.0;
        if (round2(paidAmount) != round2(expenseAmount))
            throw new RuntimeException("Paid amount must equal expense amount. Required: " + expenseAmount);

        LocalDateTime now = LocalDateTime.now();
        Payment p = new Payment();
        p.setPaymentReference(generatePaymentRef());
        p.setPaymentPurpose(PaymentPurpose.EXPENSE_PAYMENT);
        p.setBookingId(null);
        p.setBookingReference(null);
        p.setExpenseId(expense.getId());
        p.setExpenseReference(expenseReference(expense));
        p.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH);
        p.setGatewayName("Expense Payment");
        p.setTransactionReference(req.getTransactionReference() != null && !req.getTransactionReference().isBlank()
                ? req.getTransactionReference()
                : "EXP-TXN-" + generateRef());
        p.setNotes(req.getNotes());
        p.setCreatedBy(req.getProcessedBy());
        p.setCreatedAt(now);
        p.setInitiatedAt(now);
        p.setCompletedAt(now);
        p.setPaidAt(now);
        p.setBaseFare(expenseAmount);
        p.setTaxAmount(0.0);
        p.setDiscountAmount(0.0);
        p.setCouponDiscount(0.0);
        p.setLoyaltyDiscount(0.0);
        p.setLoyaltyPointsUsed(0);
        p.setTotalAmount(expenseAmount);
        p.setAmount(expenseAmount);
        p.setCurrency("USD");
        p.setStatus(PaymentStatus.COMPLETED);
        p.setPaymentStatus("PAID");
        p.setGatewayResponseCode("00");
        p.setGatewayMessage("Expense payment approved");

        Payment saved = paymentDAO.save(p);
        expenseService.markExpensePaid(expense.getId(), p.getPaymentMethod().name(), p.getTransactionReference());
        return saved;
    }
 
    /** Simulate payment gateway (replace with real gateway SDK) */
    @Transactional
    private Payment simulateGatewayResponse(Payment p, Booking booking, boolean paymentRedeemedPoints) {
        // 95% success rate simulation
        boolean success = new Random().nextInt(100) < 95;
        p.setTransactionReference("TXN-" + generateRef());
        if (success) {
            p.setStatus(PaymentStatus.COMPLETED);
            p.setGatewayResponseCode("00");
            p.setGatewayMessage("Transaction approved");
            p.setCompletedAt(LocalDateTime.now());
            p.setPaidAt(p.getCompletedAt());
            // Mark booking as CONFIRMED
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("PAID");
            bookingDAO.update(booking);
            bookingService.finalizeCommercialBenefits(booking, !paymentRedeemedPoints);
        } else {
            p.setStatus(PaymentStatus.FAILED);
            p.setGatewayResponseCode("51");
            p.setGatewayMessage("Insufficient funds / Declined");
            p.setFailureReason("Payment gateway declined the transaction.");
        }
        Payment updated = paymentDAO.update(p);
        if (success) {
            emailNotificationService.sendPaymentSuccessEmail(updated, booking);
        }
        return updated;
    }
 
    // ── Mark Failed as Cancelled ──────────────────────────────────
    @Transactional
    public Payment cancelPayment(Long id, String by) {
        Payment p = requirePayment(id);
        if (p.getStatus() == PaymentStatus.COMPLETED)
            throw new RuntimeException("Cannot cancel a completed payment. Initiate a refund instead.");
        p.setStatus(PaymentStatus.CANCELLED);
        p.setFailureReason("Cancelled by: " + by);
        return paymentDAO.update(p);
    }
 
    // ── Mark as Refunded (links to RefundModule) ──────────────────
    @Transactional
    public Payment markRefunded(Long id, String by) {
        Payment p = requirePayment(id);
        p.setStatus(PaymentStatus.REFUNDED);
        p.setNotes("Refunded by: " + by + " at " + LocalDateTime.now());
        return paymentDAO.update(p);
    }
 
    // ── Stats ─────────────────────────────────────────────────────
    public PaymentStats getStats() {
        PaymentStats s = new PaymentStats();
        s.setTotalRevenue(paymentDAO.getTotalRevenue());
        s.setMonthlyRevenue(paymentDAO.getMonthlyRevenue());
        s.setDailyRevenue(paymentDAO.getDailyRevenue());
        s.setCompletedCount(paymentDAO.countByStatus(PaymentStatus.COMPLETED));
        s.setPendingCount(paymentDAO.countByStatus(PaymentStatus.PENDING));
        s.setFailedCount(paymentDAO.countByStatus(PaymentStatus.FAILED));
        s.setRefundedCount(paymentDAO.countByStatus(PaymentStatus.REFUNDED));
        s.setTotalCount(paymentDAO.getAll().size());
        return s;
    }

    public Map<String, Object> getFinancialReport(LocalDate startDate, LocalDate endDate, String method) {
        return getFinancialReport(startDate, endDate, method, "MONTHLY");
    }

    public Map<String, Object> getFinancialReport(LocalDate startDate, LocalDate endDate, String method, String period) {
        double revenue = 0.0;
        double expense = 0.0;
        long bookingPaymentCount = 0;
        long expensePaymentCount = 0;
        String groupingPeriod = normalizePeriod(period);
        Map<String, double[]> grouped = new LinkedHashMap<>();

        for (Payment payment : paymentDAO.getAll()) {
            if (payment == null || payment.getStatus() != PaymentStatus.COMPLETED) continue;
            if (method != null && !method.isBlank() && payment.getPaymentMethod() != null
                    && !payment.getPaymentMethod().name().equalsIgnoreCase(method)) continue;
            if (method != null && !method.isBlank() && payment.getPaymentMethod() == null) continue;

            LocalDate paymentDate = paymentDate(payment);
            if (startDate != null && paymentDate.isBefore(startDate)) continue;
            if (endDate != null && paymentDate.isAfter(endDate)) continue;

            double amount = payment.getAmount() != null ? payment.getAmount()
                    : (payment.getTotalAmount() != null ? payment.getTotalAmount() : 0.0);
            String periodKey = periodKey(paymentDate, groupingPeriod);
            grouped.putIfAbsent(periodKey, new double[] {0.0, 0.0});

            if (isBookingPayment(payment)) {
                revenue = round2(revenue + amount);
                bookingPaymentCount++;
                grouped.get(periodKey)[0] = round2(grouped.get(periodKey)[0] + amount);
            } else if (isExpensePayment(payment)) {
                expense = round2(expense + amount);
                expensePaymentCount++;
                grouped.get(periodKey)[1] = round2(grouped.get(periodKey)[1] + amount);
            }
        }

        List<Map<String, Object>> groupedSummary = new ArrayList<>();
        for (Map.Entry<String, double[]> entry : grouped.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("period", entry.getKey());
            row.put("month", entry.getKey());
            row.put("revenue", round2(entry.getValue()[0]));
            row.put("expense", round2(entry.getValue()[1]));
            row.put("profit", round2(entry.getValue()[0] - entry.getValue()[1]));
            groupedSummary.add(row);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalRevenue", round2(revenue));
        report.put("totalExpenses", round2(expense));
        report.put("netProfit", round2(revenue - expense));
        report.put("bookingPaymentCount", bookingPaymentCount);
        report.put("expensePaymentCount", expensePaymentCount);
        report.put("startDate", startDate != null ? startDate.toString() : null);
        report.put("endDate", endDate != null ? endDate.toString() : null);
        report.put("paymentMethod", method != null && !method.isBlank() ? method : "ALL");
        report.put("period", groupingPeriod);
        report.put("groupedSummary", groupedSummary);
        report.put("monthlySummary", groupedSummary);
        return report;
    }
 
    // ── Helpers ───────────────────────────────────────────────────
    private Payment requirePayment(Long id) {
        Payment p = paymentDAO.getById(id);
        if (p == null) throw new RuntimeException("Payment not found: " + id);
        return p;
    }
 
    private String generatePaymentRef() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "PAY-" + date + "-" + generateRef().substring(0, 4).toUpperCase();
    }
 
    private String generateRef() {
        String c = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(c.charAt(r.nextInt(c.length())));
        return sb.toString();
    }
 
    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }

    private LocalDate paymentDate(Payment payment) {
        LocalDateTime dateTime = payment.getPaidAt() != null ? payment.getPaidAt()
                : (payment.getCompletedAt() != null ? payment.getCompletedAt() : payment.getCreatedAt());
        return dateTime != null ? dateTime.toLocalDate() : LocalDate.now();
    }

    private String normalizePeriod(String period) {
        if (period == null || period.isBlank()) return "MONTHLY";
        String value = period.trim().toUpperCase();
        return switch (value) {
            case "DAILY", "WEEKLY", "MONTHLY", "YEARLY" -> value;
            default -> "MONTHLY";
        };
    }

    private String periodKey(LocalDate date, String period) {
        return switch (period) {
            case "DAILY" -> date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            case "WEEKLY" -> {
                WeekFields weekFields = WeekFields.of(Locale.getDefault());
                int week = date.get(weekFields.weekOfWeekBasedYear());
                int year = date.get(weekFields.weekBasedYear());
                yield year + "-W" + String.format("%02d", week);
            }
            case "YEARLY" -> date.format(DateTimeFormatter.ofPattern("yyyy"));
            default -> date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        };
    }

    private boolean isBookingPayment(Payment payment) {
        return payment.getPaymentPurpose() == PaymentPurpose.BOOKING_PAYMENT
                || (payment.getPaymentPurpose() == null && payment.getBookingId() != null);
    }

    private boolean isExpensePayment(Payment payment) {
        return payment.getPaymentPurpose() == PaymentPurpose.EXPENSE_PAYMENT
                || (payment.getPaymentPurpose() == null && payment.getExpenseId() != null);
    }

    private String expenseReference(Expense expense) {
        if (expense.getReferenceNo() != null && !expense.getReferenceNo().isBlank()) {
            return expense.getReferenceNo();
        }
        return "EXP-" + expense.getId();
    }
}
 
