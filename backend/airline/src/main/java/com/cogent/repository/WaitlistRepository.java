package com.cogent.repository;

import com.cogent.model.WaitlistEntry;
import com.cogent.model.WaitlistEntry.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findAllByOrderByPriorityScoreDescCreatedAtAsc();
    List<WaitlistEntry> findByFlightIdOrderByPriorityScoreDescCreatedAtAsc(Long flightId);
    List<WaitlistEntry> findByStatusOrderByPriorityScoreDescCreatedAtAsc(WaitlistStatus status);
    Optional<WaitlistEntry> findByWaitlistReference(String ref);

    @Query("SELECT w FROM WaitlistEntry w WHERE " +
           "LOWER(w.waitlistReference) LIKE LOWER(:q) OR " +
           "LOWER(w.passengerName) LIKE LOWER(:q) OR " +
           "LOWER(w.passengerEmail) LIKE LOWER(:q) OR " +
           "LOWER(w.flightNumber) LIKE LOWER(:q) OR " +
           "LOWER(w.bookingReference) LIKE LOWER(:q) " +
           "ORDER BY w.priorityScore DESC, w.createdAt ASC")
    List<WaitlistEntry> search(@Param("q") String q);

    @Query(value = "SELECT w.flight_id, w.flight_number, w.origin, w.destination, " +
                   "COUNT(*) AS waitlisted, COALESCE(SUM(w.requested_seats), 0) AS requested, " +
                   "ROUND(AVG(w.priority_score), 0) AS avg_priority " +
                   "FROM waitlist_entries w WHERE w.status IN ('WAITING','PRIORITY','NOTIFIED') " +
                   "GROUP BY w.flight_id, w.flight_number, w.origin, w.destination " +
                   "ORDER BY requested DESC, avg_priority DESC",
           nativeQuery = true)
    List<Object[]> getOverbookingSummary();
}
