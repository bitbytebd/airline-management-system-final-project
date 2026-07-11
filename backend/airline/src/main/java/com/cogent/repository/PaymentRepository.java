package com.cogent.repository;
 
import com.cogent.model.Payment;
import com.cogent.model.Payment.PaymentStatus;
import com.cogent.model.Payment.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
 
    // ── Basic finders ─────────────────────────────────────────────
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    List<Payment> findByPaymentMethodOrderByCreatedAtDesc(PaymentMethod method);
    List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    List<Payment> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);
 
    Optional<Payment> findByPaymentReference(String ref);
    Optional<Payment> findByTransactionReference(String txRef);
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);
 
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
 
    // ── Keyword search ────────────────────────────────────────────
    @Query("SELECT p FROM Payment p WHERE " +
           "LOWER(p.paymentReference)     LIKE LOWER(:q) OR " +
           "LOWER(p.bookingReference)     LIKE LOWER(:q) OR " +
           "LOWER(p.passengerName)        LIKE LOWER(:q) OR " +
           "LOWER(p.transactionReference) LIKE LOWER(:q) OR " +
           "LOWER(p.flightNumber)         LIKE LOWER(:q) " +
           "ORDER BY p.createdAt DESC")
    List<Payment> search(@Param("q") String query);
 
    // ── Financial aggregates ──────────────────────────────────────
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p WHERE p.status = 'COMPLETED' " +
           "AND (p.paymentPurpose = 'BOOKING_PAYMENT' OR (p.paymentPurpose IS NULL AND p.bookingId IS NOT NULL))")
    Double getTotalRevenue();
 
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' AND MONTH(p.createdAt) = MONTH(CURRENT_DATE) " +
           "AND YEAR(p.createdAt) = YEAR(CURRENT_DATE) " +
           "AND (p.paymentPurpose = 'BOOKING_PAYMENT' OR (p.paymentPurpose IS NULL AND p.bookingId IS NOT NULL))")
    Double getMonthlyRevenue();
 
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' AND DATE(p.createdAt) = CURRENT_DATE " +
           "AND (p.paymentPurpose = 'BOOKING_PAYMENT' OR (p.paymentPurpose IS NULL AND p.bookingId IS NOT NULL))")
    Double getDailyRevenue();
 
    // ── Count by status ───────────────────────────────────────────
    long countByStatus(PaymentStatus status);
 
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' AND p.paymentMethod = :method")
    Double getRevenueByMethod(@Param("method") PaymentMethod method);
 
    // ── Monthly chart data ────────────────────────────────────────
    @Query(value = "SELECT DATE_FORMAT(created_at,'%Y-%m') AS mon, " +
                   "COUNT(*) AS cnt, SUM(total_amount) AS total " +
                   "FROM payments WHERE status='COMPLETED' " +
                   "AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) " +
                   "GROUP BY mon ORDER BY mon ASC",
           nativeQuery = true)
    List<Object[]> getMonthlyStats();
 
    // ── Method breakdown ─────────────────────────────────────────
    @Query(value = "SELECT payment_method, COUNT(*) AS cnt, SUM(total_amount) AS total " +
                   "FROM payments WHERE status='COMPLETED' GROUP BY payment_method",
           nativeQuery = true)
    List<Object[]> getMethodBreakdown();
}
