package com.cogent.dao;
 
import com.cogent.model.FlightStatusLog;
import com.cogent.model.FlightStatusLog.FlightStatus;
import com.cogent.repository.FlightStatusLogRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
 
@Repository(value = "flightStatusLogDAO")
@Transactional
public class FlightStatusLogDAO {
 
    @Autowired private FlightStatusLogRepository repo;
 
    public List<FlightStatusLog> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "loggedAt"));
    }
    public FlightStatusLog getById(Long id)              { return repo.findById(id).orElse(null); }
    public FlightStatusLog getLatestByFlightId(Long fid) { return repo.findTopByFlightIdOrderByLoggedAtDesc(fid).orElse(null); }
    public List<FlightStatusLog> getHistoryByFlightId(Long fid) { return repo.findByFlightIdOrderByLoggedAtDesc(fid); }
    public List<FlightStatusLog> getTodaysFlights()      { return repo.findTodaysLatest(LocalDate.now().atStartOfDay()); }
    public List<FlightStatusLog> getActiveLive()         { return repo.findActiveLive(); }
    public List<FlightStatusLog> getLiveMapLatest()      { return repo.findLiveMapLatest(); }
    public List<FlightStatusLog> getByStatus(FlightStatus s) { return repo.findByFlightStatusOrderByLoggedAtDesc(s); }
    public long countByStatus(FlightStatus s)            { return repo.countByFlightStatus(s); }
 
    @Transactional
    public FlightStatusLog save(FlightStatusLog log)     { return repo.save(log); }
    @Transactional
    public void delete(Long id)                          { repo.deleteById(id); }
}
