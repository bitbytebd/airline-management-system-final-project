package com.cogent.service;

import com.cogent.dao.AirlineDAO;
import com.cogent.model.Airline;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service(value = "airlineService")
@Transactional
public class AirlineService {

    @Autowired
    private AirlineDAO airlinesDAO;

    public List<Airline> getAllAirlines() {
        return airlinesDAO.getAll();
    }

    public Airline getAirlineById(Long id) {
        return airlinesDAO.getById(id);
    }

    //transaction required for update operations
    @Transactional
    public Airline createAirline(Airline airline) {
        return airlinesDAO.save(airline);
    }

    @Transactional
    public Airline updateAirline(Long id, Airline airlineDetails) {
    	
    	//FETCH EXISTING AIRLINE FROM DATABASE
        Airline existingAirline = airlinesDAO.getById(id);
       //check if airline exists
        
        if (existingAirline != null) {
        	
        	//UPDATE BASIC INFORMATION
            existingAirline.setAirlineName(airlineDetails.getAirlineName());
            existingAirline.setAirlineCode(airlineDetails.getAirlineCode());
         
            //UPDATE AIRLINE COUNTRY AND OPERATIONAL STATUS
            existingAirline.setCountry(airlineDetails.getCountry());
            existingAirline.setStatus(airlineDetails.getStatus());
         
            //UPDATE HEADQUARTERS AND ALLIANCE DETAILS
            existingAirline.setHeadquarters(airlineDetails.getHeadquarters());
            existingAirline.setAlliance(airlineDetails.getAlliance());
         
            //UPDATE FLEET AND HUB INFORMATION
            existingAirline.setFleetSize(airlineDetails.getFleetSize());
            existingAirline.setIataPrefix(airlineDetails.getIataPrefix());
            existingAirline.setPrimaryHub(airlineDetails.getPrimaryHub());
          
            //UPDATE SUPPORT CONTACT DETAILS
            existingAirline.setSupportEmail(airlineDetails.getSupportEmail());
            existingAirline.setSupportPhone(airlineDetails.getSupportPhone());
          
            //SAVE UPDATED AIRLINE INFORMATION
            existingAirline.setLogoUrl(airlineDetails.getLogoUrl());
           
            //RETURN NULL IF AIRLINE NOT FOUND
            return airlinesDAO.update(existingAirline);
        }
        return null;
    }

    @Transactional
    public void deleteAirline(Long id) {
        airlinesDAO.delete(id);
    }
}
