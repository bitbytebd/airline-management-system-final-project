package com.cogent.repository;
 
import com.cogent.model.FlightStatusLog;
import com.cogent.model.FlightStatusLog.FlightStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface FlightStatusLogRepository extends JpaRepository<FlightStatusLog, Long> {
 
    List<FlightStatusLog> findByFlightIdOrderByLoggedAtDesc(Long flightId);
 
    Optional<FlightStatusLog> findTopByFlightIdOrderByLoggedAtDesc(Long flightId);
 
    List<FlightStatusLog> findByFlightStatusOrderByLoggedAtDesc(FlightStatus status);
 
    @Query("""
        SELECT l FROM FlightStatusLog l
        WHERE l.loggedAt >= :start
          AND l.id IN (SELECT MAX(l2.id) FROM FlightStatusLog l2 GROUP BY l2.flightId)
        ORDER BY l.scheduledDeparture ASC
        """)
    List<FlightStatusLog> findTodaysLatest(@Param("start") LocalDateTime start);
 
    @Query("""
        SELECT l FROM FlightStatusLog l
        WHERE l.flightStatus IN ('DEPARTED','EN_ROUTE','APPROACHING','BOARDING')
          AND l.id IN (SELECT MAX(l2.id) FROM FlightStatusLog l2 GROUP BY l2.flightId)
        """)
    List<FlightStatusLog> findActiveLive();

    @Query("""
        SELECT l FROM FlightStatusLog l
        WHERE l.flightStatus IN ('DEPARTED','EN_ROUTE','APPROACHING','DELAYED','DIVERTED')
          AND l.currentLatitude IS NOT NULL
          AND l.currentLongitude IS NOT NULL
          AND l.id IN (SELECT MAX(l2.id) FROM FlightStatusLog l2 GROUP BY l2.flightId)
        ORDER BY l.loggedAt DESC
        """)
    List<FlightStatusLog> findLiveMapLatest();
 
    long countByFlightStatus(FlightStatus status);
}
 
