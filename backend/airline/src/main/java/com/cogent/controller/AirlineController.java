package com.cogent.controller;

import com.cogent.model.Airline;
import com.cogent.service.AirlineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airlines")
@CrossOrigin(origins = "http://localhost:4200")

public class AirlineController {

    @Autowired//used for making bean and object of AirlineService class
      private AirlineService airlineServices;

    @GetMapping//mapp for geting ALL AIRLINE LIST
      public List<Airline> getAllAirlines() {
    	
         return  airlineServices.getAllAirlines();
    }

    //USE CREATE METHOD FOR CREATING AIRLINE
    @PostMapping
   
    public Airline createAirline(@RequestBody Airline airline) {
    	
        return airlineServices.createAirline(airline);
    }

    @GetMapping("/{id}")//get mapping(data geting)
    public ResponseEntity<Airline> getAirlineById(@PathVariable Long id) {
    	
        Airline  airlines = airlineServices.getAirlineById(id);
        
        if (airlines != null) {
            return  ResponseEntity.ok(airlines);
        } else {
            return  ResponseEntity.notFound().build();
        }
    }

    //putMapping (data update)
    
    @PutMapping("/{id}")
    public  ResponseEntity<Airline> updateAirline(@PathVariable Long id, @RequestBody Airline airline) {
    	
        Airline updatedAirlines = airlineServices.updateAirline(id, airline);
        
        if (updatedAirlines != null) {
        	
             return ResponseEntity.ok(updatedAirlines);
        } else {
              return ResponseEntity.notFound().build();
        }
    }

    //airline (delete each by used id)
    
    @DeleteMapping("/{id}")
    
    public ResponseEntity<Void> deleteAirline(@PathVariable Long id) {
    	
         airlineServices.deleteAirline(id);
        
         return  ResponseEntity.ok().build();
    }
}