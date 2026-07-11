package com.cogent.controller;

import com.cogent.model.Flight;
import com.cogent.model.AirportData;
import com.cogent.service.FlightService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap; 
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "http://localhost:4200")

public class FlightController {
	 //@AUTOWIRED GIVES ACCESS TO USE FlightService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
	
    @Autowired
    private FlightService flightServices;

    //@PostMapping mapping for creating a new booking using (createFlight method)
    @PostMapping
    public ResponseEntity<?> createFlight(@RequestBody Flight flight) {
        try {
            Flight savedFlights = flightServices.createFlight(flight);
            return ResponseEntity.ok(savedFlights);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    //getting all the Flight( using the Flight method)
    @GetMapping
    public List<Flight> Flight() {
        return flightServices.getAllFlights();
    }

    //getting all the Flight( using the ID)
    @GetMapping("/{id}")
    public Flight getFlight(@PathVariable Long id) {
        return flightServices.getFlightById(id);
    }

    // Update Flight USING updateFlight
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFlight(@PathVariable Long id, @RequestBody Flight flight) {
        try {
            Flight updatedFlight = flightServices.updateFlight(id, flight);
            return ResponseEntity.ok(updatedFlight);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
    
    // DELETE Flight USING deleteFlight METHOD

    @DeleteMapping("/{id}")
    public void deleteFlight(@PathVariable Long id) {
        flightServices.deleteFlight(id);
    }

    //USE TO SENT AIRPORT LIST TO FRONTEND

    //  SEARCH  ALL FLIGHTS (Origin, Destination, Date) 
    @GetMapping("/search")
    public List<Flight> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String date) {
        return flightServices.searchFlights(origin, destination, date);
    }

    // Endpoint to send Airport List to Frontend (For Dropdown)
    @GetMapping("/airports")
    public List<Map<String, Object>> getAirportList() {
        return AirportData.AIRPORTS.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("code", entry.getKey());
                    map.put("city", entry.getValue().city);
                    map.put("country", entry.getValue().country);
                    map.put("lat", entry.getValue().lat);
                    map.put("lon", entry.getValue().lon);
                    return map;
                })
                .collect(Collectors.toList());
    }
}