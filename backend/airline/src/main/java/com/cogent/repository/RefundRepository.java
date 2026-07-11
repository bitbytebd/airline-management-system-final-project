package com.cogent.repository;
 
import com.cogent.model.Refund;
import com.cogent.model.Refund.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
 
    // All, sorted newest first
    List<Refund> findAllByOrderByRequestedAtDesc();
 
    // Filter by status
    List<Refund> findByStatusOrderByRequestedAtDesc(RefundStatus status);
 
    // By booking
    List<Refund> findByBookingIdOrderByRequestedAtDesc(Long bookingId);
 
    // By passenger
    List<Refund> findByPassengerIdOrderByRequestedAtDesc(Long passengerId);
 
    // By refund reference
    Optional<Refund> findByRefundReference(String ref);
 
    // Guard: prevent double refund on same booking
    boolean existsByBookingIdAndStatusNot(Long bookingId, RefundStatus excludedStatus);
 
    // Keyword search across name/reference fields
    @Query("SELECT r FROM Refund r WHERE " +
           "LOWER(r.passengerName) LIKE LOWER(:q) OR " +
           "LOWER(r.bookingReference) LIKE LOWER(:q) OR " +
           "LOWER(r.refundReference) LIKE LOWER(:q) OR " +
           "LOWER(r.flightNumber) LIKE LOWER(:q) " +
           "ORDER BY r.requestedAt DESC")
    List<Refund> search(@Param("q") String query);
 
    // Finance aggregates
    @Query("SELECT COALESCE(SUM(r.refundAmount), 0) FROM Refund r WHERE r.status = 'PROCESSED'")
    Double getTotalRefunded();
 
    @Query("SELECT COALESCE(SUM(r.penaltyAmount), 0) FROM Refund r WHERE r.status = 'PROCESSED'")
    Double getTotalPenalty();
 
    // Count by status
    long countByStatus(RefundStatus status);
 
    // Pending list used by refund-pending component
    @Query("SELECT r FROM Refund r WHERE r.status = 'PENDING' ORDER BY r.requestedAt ASC")
    List<Refund> findAllPending();
}
 