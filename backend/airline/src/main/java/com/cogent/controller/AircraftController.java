package com.cogent.controller;

import com.cogent.model.Aircraft;
import com.cogent.service.AircraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircrafts")
@CrossOrigin(origins = "http://localhost:4200")
public class AircraftController {

    @Autowired
    private AircraftService aircraftServices; //AUTUWIRED USING FOR CREATING BEAN AND OBJECT OF THE GIVEN CLASS

   //(METHOD FOR MY FRONTEND API)
    @GetMapping
    public List<Aircraft> getAllAircrafts() {
    	
          return  aircraftServices.getAllAircrafts();
    }

    //POST REQUEST(USING CREATE METHOD)
  
    @PostMapping
    public Aircraft createAircraft(@RequestBody Aircraft aircraft) {
    	
        return  aircraftServices.createAircraft(aircraft);
    }

  //ID(AIRCRAFT LIST GETTING)
    @GetMapping("/{id}")
    
    public ResponseEntity<Aircraft> getAircraftById(@PathVariable Long id) {
    	
        Aircraft aircraft = aircraftServices.getAircraftById(id);
        
        if (aircraft != null) {
            return  ResponseEntity.ok(aircraft);
        } else {
            return  ResponseEntity.notFound().build();
        }
    }

   //USE UPDATE METHOD(WANT TO UPDATE ALL AIRCRAFT GETTING BY USING ID)
    @PutMapping("/{id}")
    public ResponseEntity<Aircraft> updateAircraft(@PathVariable Long id, @RequestBody Aircraft aircraft) {
    	
         Aircraft  updatedAircraft = aircraftServices.updateAircraft(id, aircraft);
         
        if (updatedAircraft != null) {
        	
             return ResponseEntity.ok(updatedAircraft);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

//USE DELETE METHOD
    @DeleteMapping("/{id}")  //(USE ID FOR DELETING)
    public ResponseEntity<Void> deleteAircraft(@PathVariable Long id) {
    	
            aircraftServices.deleteAircraft(id);
            
        return ResponseEntity.ok().build();
    }
}