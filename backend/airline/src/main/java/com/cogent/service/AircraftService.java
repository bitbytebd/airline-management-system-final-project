package com.cogent.service;

import com.cogent.dao.AircraftDAO;
import com.cogent.model.Aircraft;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import this

import java.util.List;
     //HANDLES BUSINESS LOGIC RELATED TO AIRCRAFT MANAGEMENT
   
  @Service(value = "aircraftService")  //@Service (Marks this class as a Spring Service component)
  @Transactional   //enables database transaction management
public class AircraftService {
  
	  // injects AircraftDAO dependency automatically 
      @Autowired
      private AircraftDAO aircraftsDAO;

      
      //RETRIVES COMPLETE AIRCRAFT LIST FROM DB
    public List<Aircraft> getAllAircrafts() {
        return aircraftsDAO.getAll();
    }

    //FETCH SINGLE Aircraft BY ID
    public Aircraft getAircraftById(Long id) {
        return aircraftsDAO.getById(id);
    }

    @Transactional // DATABASE INSERT OPERATION
    public Aircraft createAircraft(Aircraft aircraft) {
        return aircraftsDAO.save(aircraft);
    }

    @Transactional // Must have this for UPDATING DATABASE OPERATIONS
    public Aircraft updateAircraft(Long id, Aircraft aircraftDetails) {
        Aircraft existingAircraft = aircraftsDAO.getById(id);
        if (existingAircraft != null) {
        	  // use to Update aircraft basic information
            existingAircraft.setModelName(aircraftDetails.getModelName());
            existingAircraft.setAircraftCode(aircraftDetails.getAircraftCode());
            existingAircraft.setAircraftName(aircraftDetails.getAircraftName());
            existingAircraft.setRegistrationNumber(aircraftDetails.getRegistrationNumber());
          
            //use to Update aircraft operational details
            existingAircraft.setCapacity(aircraftDetails.getCapacity());
            existingAircraft.setStatus(aircraftDetails.getStatus());
         
            // use to Update manufacturer and aircraft specifications
            existingAircraft.setManufacturer(aircraftDetails.getManufacturer());
            existingAircraft.setAircraftType(aircraftDetails.getAircraftType());
          
            // use for Update cabin configuration and performance details
            existingAircraft.setCabinClasses(aircraftDetails.getCabinClasses());
            existingAircraft.setRangeKm(aircraftDetails.getRangeKm());
            existingAircraft.setCruiseSpeedKmh(aircraftDetails.getCruiseSpeedKmh());
           
            // use to Update aircraft image URL
            existingAircraft.setImageUrl(aircraftDetails.getImageUrl());
          
            // Save updated aircraft into database
            return aircraftsDAO.update(existingAircraft);
        }
        return null;
    }

    @Transactional // Must have this for Save/Update/Delete
    public void deleteAircraft(Long id) {
    	aircraftsDAO.delete(id);
    }
}
