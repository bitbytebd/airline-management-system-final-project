package com.cogent.controller;

import com.cogent.model.Passenger;
import com.cogent.service.PassengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "http://localhost:4200")

public class PassengerController {
	//@AUTOWIRED GIVES ACCESS TO USE FlightService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
    @Autowired
    private PassengerService passengerServices;

    @GetMapping
    public List<Passenger> getAll() {
        return passengerServices.getAllPassengers();
    }

    @PostMapping
    public Passenger create(@RequestBody Passenger p) {
        return passengerServices.createPassenger(p);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Passenger> getById(@PathVariable Long id) {
        Passenger passenger = passengerServices.getPassengerById(id);
        return passenger != null ? ResponseEntity.ok(passenger) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Passenger> update(@PathVariable Long id, @RequestBody Passenger p) {
        Passenger passengerUpdated = passengerServices.updatePassenger(id, p);
        return passengerUpdated != null ? ResponseEntity.ok(passengerUpdated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        passengerServices.deletePassenger(id);
        return ResponseEntity.ok().build();
    }
}