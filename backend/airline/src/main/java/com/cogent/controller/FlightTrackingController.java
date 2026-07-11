package com.cogent.controller;
 
import com.cogent.dto.TrackingDTO.UpdateRequest;
import com.cogent.dto.TrackingDTO.QuickRequest;
import com.cogent.dto.TrackingDTO.AutoCalculateRequest;
import com.cogent.model.FlightStatusLog;
import com.cogent.service.FlightTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping({"/tracking", "/api/tracking"})
@CrossOrigin(origins = "http://localhost:4200")

 public class  FlightTrackingController {
	 //@AUTOWIRED GIVES ACCESS TO USE FlightService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
    @Autowired private FlightTrackingService services;
 
    //getting all the FlightStatusLog TYPES DATA( using the getTodays method)
    @GetMapping("/today")
    public ResponseEntity<List<FlightStatusLog>> getTodays() {
        return ResponseEntity.ok(services.getTodays());
    }
 
    @GetMapping("/live")
    public ResponseEntity<List<FlightStatusLog>> getLive() {
        return ResponseEntity.ok(services.getLive());
    }

    @GetMapping("/live-map")
    public ResponseEntity<List<Map<String, Object>>> getLiveMap() {
        return ResponseEntity.ok(services.getLiveMap());
    }

    @GetMapping("/premium-live")
    public ResponseEntity<List<Map<String, Object>>> getPremiumLive() {
        return ResponseEntity.ok(services.getPremiumLive());
    }

    @GetMapping("/hybrid-live/{flightId}")
    public ResponseEntity<?> getHybridLive(@PathVariable Long flightId) {
        try {
            return ResponseEntity.ok(services.getHybridLive(flightId));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/auto-calculate")
    public ResponseEntity<?> autoCalculate(@RequestBody AutoCalculateRequest req) {
        try {
            return ResponseEntity.ok(services.autoCalculate(req));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
 
    //getting all the FlightStatusLog TYPES DATA( using the getAll method)
    @GetMapping("/all")
    public ResponseEntity<List<FlightStatusLog>> getAll() {
        return ResponseEntity.ok(services.getAll());
    }
 
    //getting all the ALL LATEST FLIGHT TYPES DATA( using the getLatest method)
    @GetMapping("/{flightId}/latest")
    public ResponseEntity<?> getLatest(@PathVariable Long flightId) {
        FlightStatusLog log = services.getLatest(flightId);
        if (log == null)
            return ResponseEntity.ok(Map.of("flightStatus","SCHEDULED","progressPercent",0));
        return ResponseEntity.ok(log);
    }
 
    @GetMapping("/{flightId}/history")
    public ResponseEntity<List<FlightStatusLog>> getHistory(@PathVariable Long flightId) {
        return ResponseEntity.ok(services.getHistory(flightId));
    }
 
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable String status) {
        try { return ResponseEntity.ok(services.getByStatus(status.toUpperCase())); }
        catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("error","Invalid status: "+status)); }
    }
 
    @PostMapping("/{flightId}/update")
    public ResponseEntity<?> fullUpdate(@PathVariable Long flightId,
                                        @RequestBody UpdateRequest req,
                                        Authentication auth) {
        try {
            String by = auth != null ? auth.getName() : "system";
            return ResponseEntity.status(HttpStatus.CREATED).body(services.fullUpdate(flightId, req, by));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
 
    @PatchMapping("/{flightId}/quick")
    public ResponseEntity<?> quickUpdate(@PathVariable Long flightId,
                                         @RequestBody QuickRequest req,
                                         Authentication auth) {
        try {
            String by = auth != null ? auth.getName() : "system";
            return ResponseEntity.ok(services.quickUpdate(flightId, req.getStatus(), req.getReason(), by));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
 
