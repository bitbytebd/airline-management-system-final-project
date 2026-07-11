package com.cogent.service;

import com.cogent.dao.BaggageSupportDAO;
import com.cogent.model.BaggageSupportCase;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

    @Service(value = "baggageSupportService")  //@Service (Marks this class as a Spring Service component)
    @Transactional   //enables database transaction management
    
   public class BaggageSupportService {
    	// injects BaggageSupportDAO dependency automatically 
    @Autowired
    private BaggageSupportDAO baggageDAO;

    public List<BaggageSupportCase> getAll() {
    	 return baggageDAO.getAll(); }

    public BaggageSupportCase create(BaggageSupportCase baggageCase) {
         baggageCase.setCaseReference("BAG-" + ref());
         
          if (baggageCase.getStatus() == null || baggageCase.getStatus().isBlank()) baggageCase.setStatus("OPEN");
       
          return baggageDAO.save(baggageCase);
    }

    public BaggageSupportCase resolve(Long id) {
    	
         BaggageSupportCase baggageCases = baggageDAO.getById(id);
        if (baggageCases == null) return null;
        if ("RESOLVED".equalsIgnoreCase(baggageCases.getStatus())) return baggageCases;
        baggageCases.setStatus("RESOLVED");
        return baggageDAO.update(baggageCases);
    }

    public boolean delete(Long id) {
        BaggageSupportCase baggageCase = baggageDAO.getById(id);
        if (baggageCase == null) return false;
        baggageDAO.delete(id);
        return true;
    }

    private String ref() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 7; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}
