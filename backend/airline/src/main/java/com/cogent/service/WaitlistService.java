package com.cogent.service;

import com.cogent.model.WaitlistEntry;
import com.cogent.model.WaitlistEntry.WaitlistStatus;
import com.cogent.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service(value = "waitlistService")
@Transactional
public class WaitlistService {

    @Autowired
    private WaitlistRepository repository;

    public List<WaitlistEntry> getAll(String status, String q) {
        if (q != null && !q.isBlank()) return repository.search("%" + q.trim() + "%");
        if (status != null && !status.isBlank()) return repository.findByStatusOrderByPriorityScoreDescCreatedAtAsc(WaitlistStatus.valueOf(status));
        return repository.findAllByOrderByPriorityScoreDescCreatedAtAsc();
    }

    public WaitlistEntry getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public WaitlistEntry create(WaitlistEntry entry) {
        if (entry.getWaitlistReference() == null || entry.getWaitlistReference().isBlank()) {
            entry.setWaitlistReference("WL-" + generateRef());
        }
        entry.setPriorityScore(calculatePriority(entry));
        if (entry.getExpiresAt() == null) entry.setExpiresAt(LocalDateTime.now().plusHours(24));
        return repository.save(entry);
    }

    public WaitlistEntry update(Long id, WaitlistEntry data) {
          WaitlistEntry entry = getById(id);
        
        if (entry == null) return null;
        
         entry.setBookingId(data.getBookingId());
         
         entry.setBookingReference(data.getBookingReference());
         
         entry.setPassengerId(data.getPassengerId());
         
         entry.setPassengerName(data.getPassengerName());
         
         entry.setPassengerEmail(data.getPassengerEmail());
         
         entry.setPhoneNumber(data.getPhoneNumber());
         
         entry.setFlightId(data.getFlightId());
         
         entry.setFlightNumber(data.getFlightNumber());
         
         entry.setOrigin(data.getOrigin());
         
         entry.setDestination(data.getDestination());
         
         entry.setDepartureDate(data.getDepartureDate());
         
         entry.setClassType(data.getClassType());
         
         entry.setRequestedSeats(data.getRequestedSeats());
         
         entry.setLoyaltyTier(data.getLoyaltyTier());
         
         entry.setFareOffer(data.getFareOffer());
         
         entry.setCurrency(data.getCurrency());
         
         entry.setStatus(data.getStatus());
         
         entry.setNotificationChannel(data.getNotificationChannel());
         
         entry.setExpiresAt(data.getExpiresAt());
         
         entry.setNotes(data.getNotes());
         
          entry.setPriorityScore(calculatePriority(entry));
          
        return repository.save(entry);
    }

      public void delete(Long id) {
    	   repository.deleteById(id);
       }

    public WaitlistEntry notifyPassenger(Long id) {
          WaitlistEntry entry = require(id);
           entry.setStatus(WaitlistStatus.NOTIFIED);
          entry.setLastNotifiedAt(LocalDateTime.now());
        
          return repository.save(entry);
    }

    public WaitlistEntry confirm(Long id) {
        WaitlistEntry entry = require(id);
        entry.setStatus(WaitlistStatus.CONFIRMED);
        return repository.save(entry);
    }

    public WaitlistEntry cancel(Long id) {
          WaitlistEntry entry = require(id);
         entry.setStatus(WaitlistStatus.CANCELLED);
      
        return repository.save(entry);
    }

    public Map<String, Object> stats() {
    	
        List<WaitlistEntry> all = repository.findAll();
        
        long active = all.stream().filter(w -> w.getStatus() == WaitlistStatus.WAITING || w.getStatus() == WaitlistStatus.PRIORITY || w.getStatus() == WaitlistStatus.NOTIFIED).count();
       
        long confirmed = all.stream().filter(w -> w.getStatus() == WaitlistStatus.CONFIRMED).count();
       
        long priority = all.stream().filter(w -> w.getStatus() == WaitlistStatus.PRIORITY).count();
       
        int requestedSeats = all.stream()
                .filter(w -> w.getStatus() == WaitlistStatus.WAITING || w.getStatus() == WaitlistStatus.PRIORITY || w.getStatus() == WaitlistStatus.NOTIFIED)
                .mapToInt(w -> w.getRequestedSeats() == null ? 0 : w.getRequestedSeats()).sum();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("totalEntries", all.size());
        map.put("activeQueue", active);
        map.put("priorityEntries", priority);
        map.put("confirmedEntries", confirmed);
        map.put("requestedSeats", requestedSeats);
        return map;
    }

    public List<Object[]> overbookingSummary() {
        return repository.getOverbookingSummary();
    }

    private WaitlistEntry require(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Waitlist entry not found: " + id));
    }

    private int calculatePriority(WaitlistEntry entry) {
    	
        int score = 50;
        
        String tier = entry.getLoyaltyTier() == null ? "" : entry.getLoyaltyTier().toUpperCase();
        
        if ("SILVER".equals(tier)) score += 8;
        
        if ("GOLD".equals(tier)) score += 16;
        
        if ("PLATINUM".equals(tier)) score += 24;
        
        String cabin = entry.getClassType() == null ? "" : entry.getClassType().toUpperCase();
        
        if (cabin.contains("BUSINESS")) score += 10;
        
        if (cabin.contains("FIRST")) score += 15;
        
        if (entry.getFareOffer() != null && entry.getFareOffer() >= 700) score += 8;
        
        if (entry.getStatus() == WaitlistStatus.PRIORITY) score += 12;
        
        return Math.min(score, 100);
    }

    private String generateRef() {
    	
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        
        Random random = new Random();
        
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        
        return sb.toString();
    }
}
