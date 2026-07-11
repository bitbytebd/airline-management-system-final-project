package com.cogent.service;
 
import com.cogent.dao.FlightDAO;
import com.cogent.dao.FlightStatusLogDAO;
import com.cogent.dao.BookingDAO;
import com.cogent.dto.TrackingDTO.AutoCalculateRequest;
import com.cogent.dto.TrackingDTO.UpdateRequest;
import com.cogent.model.Booking;
import com.cogent.model.Flight;
import com.cogent.model.FlightStatusLog;
import com.cogent.model.FlightStatusLog.FlightStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@Service(value = "flightTrackingService")
@Transactional
public class FlightTrackingService {
    private static final String SCHEDULED_ROUTE_MODE = "SIMULATED_ROUTE";
    private static final String SCHEDULED_ROUTE_SOURCE = "SCHEDULED_ROUTE_SIMULATION";
 
    @Autowired
    private FlightStatusLogDAO flightLogDAO;
    
    @Autowired
    private FlightDAO flightsDAO;

    @Autowired
    private AirportCoordinateService airportCoordinateService;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private BookingDAO bookingDAO;
 
    public List<FlightStatusLog> getAll()  { 
    	   return flightLogDAO.getAll();
    	   }
    public List<FlightStatusLog> getTodays() {
    	return flightLogDAO.getTodaysFlights();
    	}
    
    public List<FlightStatusLog> getLive() {
    	   return flightLogDAO.getActiveLive();
    	   }

    public List<Map<String, Object>> getLiveMap() {
        return flightsDAO.getAll().stream()
            .map(this::buildLiveMapResponse)
            .filter(map -> map != null)
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPremiumLive() {
        LocalDate today = LocalDate.now();
        return flightsDAO.getAll().stream()
            .filter(flight -> flight != null && flight.getDepartureDate() != null && !flight.getDepartureDate().isBefore(today))
            .filter(flight -> flight.getStatus() == null || !"CANCELLED".equalsIgnoreCase(flight.getStatus()))
            .map(this::buildPremiumLiveResponse)
            .filter(map -> map != null)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getHybridLive(Long flightId) {
        Flight flight = flightsDAO.getById(flightId);
        if (flight == null) throw new RuntimeException("Flight not found: " + flightId);
        Map<String, Object> response = buildPremiumLiveResponse(flight);
        if (response == null) throw new RuntimeException("Airport coordinates not found for selected route.");
        return response;
    }
    
    public FlightStatusLog getLatest(Long fid) {
        Flight flight = flightsDAO.getById(fid);
        if (flight == null) return flightLogDAO.getLatestByFlightId(fid);
        Map<String, Object> simulated = simulatedLiveMapFromSchedule(flight, flightLogDAO.getLatestByFlightId(fid));
        return simulated != null ? logFromSimulatedMap(simulated, flight) : flightLogDAO.getLatestByFlightId(fid);
    }
    
    public List<FlightStatusLog> getHistory(Long fid) {
    	  return flightLogDAO.getHistoryByFlightId(fid);
    	  }
    
    public List<FlightStatusLog> getByStatus(String s){
    	    return flightLogDAO.getByStatus(FlightStatus.valueOf(s));
    	    }
 
      @Transactional
        public FlightStatusLog fullUpdate(Long flightId, UpdateRequest req, String by) {
             Flight f = flightsDAO.getById(flightId);
           if (f == null) throw new RuntimeException("Flight not found: " + flightId);
 
        FlightStatusLog log = new FlightStatusLog();
                        log.setFlightId(flightId);
                        log.setFlightNumber(f.getFlightNumber());
                        log.setOrigin(f.getOrigin());
                        log.setDestination(f.getDestination());
 
        if (f.getDepartureDate() != null && f.getDepartureTime() != null)
               log.setScheduledDeparture(LocalDateTime.of(f.getDepartureDate(), f.getDepartureTime()));
        if (f.getArrivalDate() != null && f.getArrivalTime() != null)
               log.setScheduledArrival(LocalDateTime.of(f.getArrivalDate(), f.getArrivalTime()));
 
        FlightStatus status = req.getFlightStatus() != null ? req.getFlightStatus() : FlightStatus.SCHEDULED;
        
                  log.setFlightStatus(status);
            
                   log.setDelayMinutes(req.getDelayMinutes() != null ? req.getDelayMinutes() : 0);
            
                  log.setDelayReason(req.getDelayReason());
            
                  log.setDepartureGate(req.getDepartureGate());
            
                   log.setArrivalGate(req.getArrivalGate());
            
                  log.setTerminal(req.getTerminal());
            
                   log.setCurrentLatitude(req.getCurrentLatitude());
             
                   log.setCurrentLongitude(req.getCurrentLongitude());
            
                   log.setAltitudeFt(req.getAltitudeFt());
             
                  log.setSpeedKmh(req.getSpeedKmh());

                  log.setHeadingDegree(req.getHeadingDegree());

                  log.setDistanceRemainingKm(req.getDistanceRemainingKm());
                  log.setRemainingDistanceKm(req.getRemainingDistanceKm());
                  log.setDistanceKm(req.getDistanceKm());
                  log.setOriginLatitude(req.getOriginLatitude());
                  log.setOriginLongitude(req.getOriginLongitude());
                  log.setDestinationLatitude(req.getDestinationLatitude());
                  log.setDestinationLongitude(req.getDestinationLongitude());

                  log.setEstimatedLandingMinutes(req.getEstimatedLandingMinutes());

                  log.setLastGpsUpdatedAt(parseDateTime(req.getLastGpsUpdatedAt(), LocalDateTime.now()));

                  log.setAircraftIcao(req.getAircraftIcao());

                  log.setAircraftRegistration(req.getAircraftRegistration());

                  log.setTrackingSource(req.getTrackingSource() != null ? req.getTrackingSource() : "MANUAL");
                  log.setTrackingMode(req.getTrackingMode() != null ? req.getTrackingMode() : "MANUAL");
                  log.setLastTrackedAt(LocalDateTime.now());
            
                  log.setProgressPercent(req.getProgressPercent() != null ? req.getProgressPercent() : 0);
            
                 log.setLoggedAt(LocalDateTime.now());
            
                log.setLoggedBy(by);
 
        if (status == FlightStatus.DEPARTED && req.getActualDeparture() == null)
               log.setActualDeparture(LocalDateTime.now());
        else
               log.setActualDeparture(parseDateTime(req.getActualDeparture(), null));
        
        if (status == FlightStatus.ARRIVED) {
        	
            log.setActualArrival(LocalDateTime.now());
            
            log.setProgressPercent(100);
        }
        else
            log.setActualArrival(parseDateTime(req.getActualArrival(), null));

        log.setEstimatedArrival(parseDateTime(req.getEstimatedArrival(), null));
        FlightStatusLog saved = flightLogDAO.save(log);
        emailNotificationService.sendFlightStatusEmail(saved);
        return saved;
    }

    public Map<String, Object> autoCalculate(AutoCalculateRequest req) {
        Flight flight = req.getFlightId() != null ? flightsDAO.getById(req.getFlightId()) : null;
        if (flight == null) {
            flight = new Flight();
            flight.setId(req.getFlightId());
            flight.setFlightNumber(req.getFlightNumber());
        }

        if (hasText(req.getOrigin())) flight.setOrigin(req.getOrigin());
        if (hasText(req.getDestination())) flight.setDestination(req.getDestination());
        if (hasText(req.getDepartureDate())) flight.setDepartureDate(parseDate(req.getDepartureDate(), flight.getDepartureDate()));
        if (hasText(req.getDepartureTime())) flight.setDepartureTime(parseTime(req.getDepartureTime(), flight.getDepartureTime()));

        Map<String, Object> calculated = simulatedLiveMapFromSchedule(flight, null);
        if (calculated == null) {
            throw new RuntimeException("Airport coordinates not found for selected route.");
        }
        return calculated;
    }
 
    @Transactional
    public FlightStatusLog quickUpdate(Long flightId, String status, String reason, String by) {
        Flight f = flightsDAO.getById(flightId);
        if (f == null) throw new RuntimeException("Flight not found: " + flightId);
 
        FlightStatusLog log = new FlightStatusLog();
        
          log.setFlightId(flightId);
          
          log.setFlightNumber(f.getFlightNumber());
          
           log.setOrigin(f.getOrigin());
        
          log.setDestination(f.getDestination());
        
          log.setFlightStatus(FlightStatus.valueOf(status));
        
          log.setDelayReason(reason);

          log.setTrackingSource("MANUAL");

          log.setTrackingMode("MANUAL");

          log.setLastTrackedAt(LocalDateTime.now());
        
          log.setLoggedAt(LocalDateTime.now());
          
          log.setLoggedBy(by);
 
        if (f.getDepartureDate() != null && f.getDepartureTime() != null)
              log.setScheduledDeparture(LocalDateTime.of(f.getDepartureDate(), f.getDepartureTime()));
        
        if (f.getArrivalDate() != null && f.getArrivalTime() != null)
              log.setScheduledArrival(LocalDateTime.of(f.getArrivalDate(), f.getArrivalTime()));

        FlightStatusLog saved = flightLogDAO.save(log);
        emailNotificationService.sendFlightStatusEmail(saved);
        return saved;
    }

    private LocalDateTime parseDateTime(String value, LocalDateTime fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        try {
            return LocalDateTime.parse(value.trim());
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private LocalTime parseTime(String value, LocalTime fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        try {
            return LocalTime.parse(value.trim());
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private Object safe(Object value) {
        return value == null ? "" : value;
    }

    private Map<String, Object> buildPremiumLiveResponse(Flight flight) {
        Map<String, Object> source = buildLiveMapResponse(flight);
        if (source == null || !hasClearPosition(source)) return null;

        return Map.<String, Object>ofEntries(
            Map.entry("flightId", safe(source.get("flightId"))),
            Map.entry("flightNumber", safe(source.get("flightNumber"))),
            Map.entry("bookingReferences", safe(source.get("bookingReferences"))),
            Map.entry("aircraftIcao", safe(source.get("aircraftIcao"))),
            Map.entry("aircraftRegistration", safe(source.get("aircraftRegistration"))),
            Map.entry("origin", safe(source.get("origin"))),
            Map.entry("destination", safe(source.get("destination"))),
            Map.entry("originLatitude", safe(source.get("originLatitude"))),
            Map.entry("originLongitude", safe(source.get("originLongitude"))),
            Map.entry("destinationLatitude", safe(source.get("destinationLatitude"))),
            Map.entry("destinationLongitude", safe(source.get("destinationLongitude"))),
            Map.entry("currentLatitude", safe(source.get("currentLatitude"))),
            Map.entry("currentLongitude", safe(source.get("currentLongitude"))),
            Map.entry("altitudeFt", safe(source.get("altitudeFt"))),
            Map.entry("speedKmh", safe(source.get("speedKmh"))),
            Map.entry("headingDegree", safe(source.get("headingDegree"))),
            Map.entry("distanceKm", safe(source.get("distanceKm"))),
            Map.entry("remainingDistanceKm", safe(source.get("remainingDistanceKm"))),
            Map.entry("distanceRemainingKm", safe(source.get("remainingDistanceKm"))),
            Map.entry("status", safe(source.get("flightStatus"))),
            Map.entry("flightStatus", safe(source.get("flightStatus"))),
            Map.entry("progressPercent", safe(source.get("progressPercent"))),
            Map.entry("estimatedLandingMinutes", safe(source.get("estimatedLandingMinutes"))),
            Map.entry("estimatedArrival", safe(source.get("estimatedArrival"))),
            Map.entry("trackingMode", safe(source.get("trackingMode"))),
            Map.entry("trackingSource", safe(source.get("trackingSource"))),
            Map.entry("lastTrackedAt", safe(source.get("lastTrackedAt")))
        );
    }

    private Map<String, Object> buildLiveMapResponse(Flight flight) {
        if (flight == null || flight.getId() == null) return null;

        FlightStatusLog latestLog = flightLogDAO.getLatestByFlightId(flight.getId());
        return simulatedLiveMapFromSchedule(flight, latestLog);
    }

    private Map<String, Object> liveMapFromLog(Flight flight, FlightStatusLog log, String mode) {
        FlightStatus status = resolveStatus(flight, log.getFlightStatus());
        Double originLatitude = coordinateValue(firstDouble(log.getOriginLatitude(), flight.getOriginLatitude()), flight.getOrigin(), true);
        Double originLongitude = coordinateValue(firstDouble(log.getOriginLongitude(), flight.getOriginLongitude()), flight.getOrigin(), false);
        Double destinationLatitude = coordinateValue(firstDouble(log.getDestinationLatitude(), flight.getDestinationLatitude()), flight.getDestination(), true);
        Double destinationLongitude = coordinateValue(firstDouble(log.getDestinationLongitude(), flight.getDestinationLongitude()), flight.getDestination(), false);
        Double distanceKm = firstDouble(log.getDistanceKm(), resolveDistanceKm(flight, originLatitude, originLongitude, destinationLatitude, destinationLongitude));
        Double remainingDistanceKm = firstDouble(log.getRemainingDistanceKm(), log.getDistanceRemainingKm());
        return Map.<String, Object>ofEntries(
            Map.entry("flightId", safe(log.getFlightId())),
            Map.entry("flightNumber", safe(log.getFlightNumber())),
            Map.entry("origin", safe(log.getOrigin())),
            Map.entry("destination", safe(log.getDestination())),
            Map.entry("flightStatus", safe(status)),
            Map.entry("currentLatitude", safe(log.getCurrentLatitude())),
            Map.entry("currentLongitude", safe(log.getCurrentLongitude())),
            Map.entry("originLatitude", safe(originLatitude)),
            Map.entry("originLongitude", safe(originLongitude)),
            Map.entry("destinationLatitude", safe(destinationLatitude)),
            Map.entry("destinationLongitude", safe(destinationLongitude)),
            Map.entry("altitudeFt", safe(log.getAltitudeFt())),
            Map.entry("speedKmh", safe(log.getSpeedKmh())),
            Map.entry("headingDegree", safe(log.getHeadingDegree())),
            Map.entry("progressPercent", safe(log.getProgressPercent())),
            Map.entry("estimatedArrival", safe(log.getEstimatedArrival())),
            Map.entry("estimatedLandingMinutes", safe(log.getEstimatedLandingMinutes())),
            Map.entry("distanceKm", safe(distanceKm)),
            Map.entry("remainingDistanceKm", safe(remainingDistanceKm)),
            Map.entry("distanceRemainingKm", safe(remainingDistanceKm)),
            Map.entry("departureGate", safe(log.getDepartureGate())),
            Map.entry("arrivalGate", safe(log.getArrivalGate())),
            Map.entry("terminal", safe(log.getTerminal())),
            Map.entry("delayMinutes", safe(log.getDelayMinutes())),
            Map.entry("delayReason", safe(log.getDelayReason())),
            Map.entry("aircraftIcao", safe(firstText(log.getAircraftIcao(), flight.getAircraftIcao()))),
            Map.entry("aircraftRegistration", safe(firstText(log.getAircraftRegistration(), flight.getAircraftRegistration()))),
            Map.entry("trackingMode", safe(mode)),
            Map.entry("trackingSource", safe(firstText(log.getTrackingSource(), mode))),
            Map.entry("lastTrackedAt", safe(log.getLastTrackedAt() != null ? log.getLastTrackedAt() : (log.getLastGpsUpdatedAt() != null ? log.getLastGpsUpdatedAt() : log.getLoggedAt())))
        );
    }

    private Map<String, Object> liveMapFromFlight(Flight flight, Double latitude, Double longitude, String mode) {
        Double originLatitude = coordinateValue(flight.getOriginLatitude(), flight.getOrigin(), true);
        Double originLongitude = coordinateValue(flight.getOriginLongitude(), flight.getOrigin(), false);
        Double destinationLatitude = coordinateValue(flight.getDestinationLatitude(), flight.getDestination(), true);
        Double destinationLongitude = coordinateValue(flight.getDestinationLongitude(), flight.getDestination(), false);
        Double distanceKm = resolveDistanceKm(flight, originLatitude, originLongitude, destinationLatitude, destinationLongitude);
        Double remainingDistanceKm = distanceKm != null && hasCoordinates(destinationLatitude, destinationLongitude)
            ? haversineKm(latitude, longitude, destinationLatitude, destinationLongitude)
            : null;
        LocalDateTime arrival = resolveEstimatedArrival(flight, distanceKm);
        FlightStatus status = resolveStatus(flight, null);
        return Map.<String, Object>ofEntries(
            Map.entry("flightId", safe(flight.getId())),
            Map.entry("flightNumber", safe(flight.getFlightNumber())),
            Map.entry("bookingReferences", safe(bookingReferencesForFlight(flight.getId()))),
            Map.entry("origin", safe(flight.getOrigin())),
            Map.entry("destination", safe(flight.getDestination())),
            Map.entry("flightStatus", safe(status)),
            Map.entry("currentLatitude", safe(latitude)),
            Map.entry("currentLongitude", safe(longitude)),
            Map.entry("originLatitude", safe(originLatitude)),
            Map.entry("originLongitude", safe(originLongitude)),
            Map.entry("destinationLatitude", safe(destinationLatitude)),
            Map.entry("destinationLongitude", safe(destinationLongitude)),
            Map.entry("altitudeFt", safe(flight.getAltitudeFt())),
            Map.entry("speedKmh", safe(flight.getSpeedKmh())),
            Map.entry("headingDegree", safe(flight.getHeadingDegree())),
            Map.entry("progressPercent", safe(flight.getProgressPercent())),
            Map.entry("estimatedArrival", safe(arrival)),
            Map.entry("estimatedLandingMinutes", safe(minutesUntil(arrival))),
            Map.entry("distanceKm", safe(distanceKm)),
            Map.entry("remainingDistanceKm", safe(remainingDistanceKm)),
            Map.entry("distanceRemainingKm", safe(remainingDistanceKm)),
            Map.entry("departureGate", ""),
            Map.entry("arrivalGate", ""),
            Map.entry("terminal", ""),
            Map.entry("delayMinutes", 0),
            Map.entry("delayReason", ""),
            Map.entry("aircraftIcao", safe(flight.getAircraftIcao())),
            Map.entry("aircraftRegistration", safe(flight.getAircraftRegistration())),
            Map.entry("trackingMode", safe(mode)),
            Map.entry("trackingSource", safe(mode)),
            Map.entry("lastTrackedAt", safe(flight.getLastTrackedAt()))
        );
    }

    private Map<String, Object> simulatedLiveMapFromSchedule(Flight flight, FlightStatusLog latestLog) {
        Double originLatitude = coordinateValue(flight.getOriginLatitude(), flight.getOrigin(), true);
        Double originLongitude = coordinateValue(flight.getOriginLongitude(), flight.getOrigin(), false);
        Double destinationLatitude = coordinateValue(flight.getDestinationLatitude(), flight.getDestination(), true);
        Double destinationLongitude = coordinateValue(flight.getDestinationLongitude(), flight.getDestination(), false);

        if (!hasCoordinates(originLatitude, originLongitude)
            || !hasCoordinates(destinationLatitude, destinationLongitude)) {
            return null;
        }

        LocalDateTime departure = combineDateTime(flight.getDepartureDate(), flight.getDepartureTime());
        Double distanceKm = resolveDistanceKm(flight, originLatitude, originLongitude, destinationLatitude, destinationLongitude);
        LocalDateTime arrival = resolveEstimatedArrival(flight, distanceKm);
        if (departure == null || arrival == null || !arrival.isAfter(departure)) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        double progress = calculateProgress(now, departure, arrival);
        FlightStatus status = statusFromProgress(now, departure, arrival, progress);
        Double latitude = interpolate(originLatitude, destinationLatitude, progress);
        Double longitude = interpolate(originLongitude, destinationLongitude, progress);
        long landingMinutes = Math.max(0, Duration.between(now, arrival).toMinutes());
        Double remainingDistanceKm = distanceKm != null ? Math.max(0, distanceKm * (1 - progress)) : null;
        Integer heading = calculateHeading(
            originLatitude,
            originLongitude,
            destinationLatitude,
            destinationLongitude
        );
        Integer altitudeFt = simulatedAltitude(progress, status);
        Integer speedKmh = status == FlightStatus.SCHEDULED || status == FlightStatus.LANDED ? 0 : 850;

        return Map.<String, Object>ofEntries(
            Map.entry("flightId", safe(flight.getId())),
            Map.entry("flightNumber", safe(flight.getFlightNumber())),
            Map.entry("origin", safe(flight.getOrigin())),
            Map.entry("destination", safe(flight.getDestination())),
            Map.entry("flightStatus", safe(status)),
            Map.entry("currentLatitude", safe(latitude)),
            Map.entry("currentLongitude", safe(longitude)),
            Map.entry("originLatitude", safe(originLatitude)),
            Map.entry("originLongitude", safe(originLongitude)),
            Map.entry("destinationLatitude", safe(destinationLatitude)),
            Map.entry("destinationLongitude", safe(destinationLongitude)),
            Map.entry("altitudeFt", safe(altitudeFt)),
            Map.entry("speedKmh", safe(speedKmh)),
            Map.entry("headingDegree", safe(defaultInteger(flight.getHeadingDegree(), heading))),
            Map.entry("progressPercent", safe((int) Math.round(progress * 100))),
            Map.entry("estimatedArrival", safe(arrival)),
            Map.entry("estimatedLandingMinutes", safe(landingMinutes)),
            Map.entry("distanceKm", safe(distanceKm)),
            Map.entry("remainingDistanceKm", safe(remainingDistanceKm)),
            Map.entry("distanceRemainingKm", safe(remainingDistanceKm)),
            Map.entry("departureGate", safe(latestLog != null ? latestLog.getDepartureGate() : "")),
            Map.entry("arrivalGate", safe(latestLog != null ? latestLog.getArrivalGate() : "")),
            Map.entry("terminal", safe(latestLog != null ? latestLog.getTerminal() : "")),
            Map.entry("delayMinutes", safe(latestLog != null ? latestLog.getDelayMinutes() : 0)),
            Map.entry("delayReason", safe(latestLog != null ? latestLog.getDelayReason() : "Simulated route from schedule")),
            Map.entry("aircraftIcao", safe(flight.getAircraftIcao())),
            Map.entry("aircraftRegistration", safe(flight.getAircraftRegistration())),
            Map.entry("trackingMode", SCHEDULED_ROUTE_MODE),
            Map.entry("trackingSource", SCHEDULED_ROUTE_SOURCE),
            Map.entry("lastTrackedAt", safe(now))
        );
    }

    private String bookingReferencesForFlight(Long flightId) {
        if (flightId == null) return "";
        try {
            return bookingDAO.getBookingsByFlightId(flightId).stream()
                .map(Booking::getBookingReference)
                .filter(ref -> ref != null && !ref.trim().isEmpty())
                .collect(Collectors.joining(", "));
        } catch (Exception ex) {
            return "";
        }
    }

    private FlightStatusLog logFromSimulatedMap(Map<String, Object> map, Flight flight) {
        FlightStatusLog log = new FlightStatusLog();
        log.setFlightId(flight.getId());
        log.setFlightNumber(String.valueOf(map.get("flightNumber")));
        log.setOrigin(String.valueOf(map.get("origin")));
        log.setDestination(String.valueOf(map.get("destination")));
        log.setFlightStatus(FlightStatus.valueOf(String.valueOf(map.get("flightStatus"))));
        log.setScheduledDeparture(combineDateTime(flight.getDepartureDate(), flight.getDepartureTime()));
        log.setScheduledArrival(combineDateTime(flight.getArrivalDate(), flight.getArrivalTime()));
        log.setCurrentLatitude(asDouble(map.get("currentLatitude")));
        log.setCurrentLongitude(asDouble(map.get("currentLongitude")));
        log.setOriginLatitude(asDouble(map.get("originLatitude")));
        log.setOriginLongitude(asDouble(map.get("originLongitude")));
        log.setDestinationLatitude(asDouble(map.get("destinationLatitude")));
        log.setDestinationLongitude(asDouble(map.get("destinationLongitude")));
        log.setAltitudeFt(asInteger(map.get("altitudeFt")));
        log.setSpeedKmh(asInteger(map.get("speedKmh")));
        log.setHeadingDegree(asInteger(map.get("headingDegree")));
        log.setProgressPercent(asInteger(map.get("progressPercent")));
        log.setDistanceKm(asDouble(map.get("distanceKm")));
        log.setRemainingDistanceKm(asDouble(map.get("remainingDistanceKm")));
        log.setDistanceRemainingKm(asDouble(map.get("distanceRemainingKm")));
        log.setEstimatedLandingMinutes(asInteger(map.get("estimatedLandingMinutes")));
        Object arrival = map.get("estimatedArrival");
        if (arrival instanceof LocalDateTime) log.setEstimatedArrival((LocalDateTime) arrival);
        log.setTrackingMode(SCHEDULED_ROUTE_MODE);
        log.setTrackingSource(SCHEDULED_ROUTE_SOURCE);
        log.setLastTrackedAt(LocalDateTime.now());
        log.setLoggedAt(LocalDateTime.now());
        log.setLoggedBy("schedule-simulator");
        return log;
    }

    private Double asDouble(Object value) {
        if (value instanceof Number) return ((Number) value).doubleValue();
        try { return value == null || String.valueOf(value).isBlank() ? null : Double.valueOf(String.valueOf(value)); }
        catch (Exception ex) { return null; }
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number) return ((Number) value).intValue();
        try { return value == null || String.valueOf(value).isBlank() ? null : Integer.valueOf(String.valueOf(value)); }
        catch (Exception ex) { return null; }
    }

    private FlightStatus resolveStatus(Flight flight, FlightStatus preferred) {
        if (preferred != null && preferred != FlightStatus.SCHEDULED) return preferred;
        LocalDateTime departure = combineDateTime(flight.getDepartureDate(), flight.getDepartureTime());
        LocalDateTime arrival = combineDateTime(flight.getArrivalDate(), flight.getArrivalTime());
        if (departure == null || arrival == null || !arrival.isAfter(departure)) {
            return preferred != null ? preferred : FlightStatus.SCHEDULED;
        }
        LocalDateTime now = LocalDateTime.now();
        return statusFromProgress(now, departure, arrival, calculateProgress(now, departure, arrival));
    }

    private FlightStatus statusFromProgress(LocalDateTime now, LocalDateTime departure, LocalDateTime arrival, double progress) {
        if (now.isBefore(departure)) return FlightStatus.SCHEDULED;
        if (!now.isBefore(arrival)) return FlightStatus.LANDED;
        if (Duration.between(now, arrival).toMinutes() <= 20) return FlightStatus.APPROACHING;
        return FlightStatus.EN_ROUTE;
    }

    private double calculateProgress(LocalDateTime now, LocalDateTime departure, LocalDateTime arrival) {
        long totalSeconds = Math.max(1, Duration.between(departure, arrival).getSeconds());
        long elapsedSeconds = Duration.between(departure, now).getSeconds();
        return Math.max(0, Math.min(1, elapsedSeconds / (double) totalSeconds));
    }

    private Double resolveDistanceKm(Flight flight, Double originLat, Double originLng, Double destinationLat, Double destinationLng) {
        if (flight.getDistance() != null && flight.getDistance() > 0) return flight.getDistance();
        if (!hasCoordinates(originLat, originLng) || !hasCoordinates(destinationLat, destinationLng)) return null;
        return haversineKm(originLat, originLng, destinationLat, destinationLng);
    }

    private Double haversineKm(Double originLat, Double originLng, Double destinationLat, Double destinationLng) {
        if (!hasCoordinates(originLat, originLng) || !hasCoordinates(destinationLat, destinationLng)) return null;
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(destinationLat - originLat);
        double dLng = Math.toRadians(destinationLng - originLng);
        double lat1 = Math.toRadians(originLat);
        double lat2 = Math.toRadians(destinationLat);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((earthRadiusKm * c) * 10.0) / 10.0;
    }

    private LocalDateTime resolveEstimatedArrival(Flight flight, Double distanceKm) {
        LocalDateTime scheduledArrival = combineDateTime(flight.getArrivalDate(), flight.getArrivalTime());
        if (scheduledArrival != null) return scheduledArrival;
        LocalDateTime departure = combineDateTime(flight.getDepartureDate(), flight.getDepartureTime());
        if (departure == null || distanceKm == null || distanceKm <= 0) return null;
        long flightMinutes = (long) Math.ceil((distanceKm / 850.0) * 60.0) + 30;
        return departure.plusMinutes(flightMinutes);
    }

    private long minutesUntil(LocalDateTime target) {
        return target == null ? 0 : Math.max(0, Duration.between(LocalDateTime.now(), target).toMinutes());
    }

    private Integer simulatedAltitude(double progress, FlightStatus status) {
        if (status == FlightStatus.SCHEDULED || status == FlightStatus.LANDED) return 0;
        if (progress < 0.15) return (int) Math.round(35000 * (progress / 0.15));
        if (progress > 0.85) return (int) Math.round(35000 * Math.max(0, (1 - progress) / 0.15));
        return 35000;
    }

    private Double interpolate(Double start, Double end, double progress) {
        if (start == null || end == null) return null;
        return start + ((end - start) * progress);
    }

    private Double coordinateValue(Double storedValue, String location, boolean latitude) {
        if (storedValue != null) return storedValue;
        return airportCoordinateService.resolve(location)
            .map(airport -> latitude ? airport.latitude() : airport.longitude())
            .orElse(null);
    }

    private Integer calculateHeading(Double originLat, Double originLng, Double destinationLat, Double destinationLng) {
        if (originLat == null || originLng == null || destinationLat == null || destinationLng == null) return 90;
        double lat1 = Math.toRadians(originLat);
        double lat2 = Math.toRadians(destinationLat);
        double deltaLng = Math.toRadians(destinationLng - originLng);
        double y = Math.sin(deltaLng) * Math.cos(lat2);
        double x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
        return (int) Math.round((Math.toDegrees(Math.atan2(y, x)) + 360) % 360);
    }

    private LocalDateTime combineDateTime(LocalDate date, LocalTime time) {
        return date != null && time != null ? LocalDateTime.of(date, time) : null;
    }

    private boolean hasCoordinates(FlightStatusLog log) {
        return log != null && hasCoordinates(log.getCurrentLatitude(), log.getCurrentLongitude());
    }

    private boolean hasCoordinates(Double latitude, Double longitude) {
        return latitude != null && longitude != null;
    }

    private boolean hasClearPosition(Map<String, Object> map) {
        return map != null
            && map.get("currentLatitude") instanceof Number
            && map.get("currentLongitude") instanceof Number;
    }

    private Integer defaultInteger(Integer value, Integer fallback) {
        return value != null ? value : fallback;
    }

    private String firstText(String primary, String fallback) {
        return primary != null && !primary.trim().isEmpty() ? primary : fallback;
    }

    private Double firstDouble(Double primary, Double fallback) {
        return primary != null ? primary : fallback;
    }
}
