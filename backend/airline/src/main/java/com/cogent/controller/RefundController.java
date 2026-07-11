package com.cogent.controller;

import com.cogent.dto.RefundDTO.InitiateRequest;
import com.cogent.dto.RefundDTO.StatsResponse;
import com.cogent.model.Refund;
import com.cogent.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/refunds") // Note: Base path is /api/refunds
@CrossOrigin(origins = "http://localhost:4200")
public class RefundController {

    @Autowired private RefundService services;

    //getting all the Refund TYPES DATA( using the getAll method)
    @GetMapping
    public ResponseEntity<List<Refund>> getAll() {
        return ResponseEntity.ok(services.getAll());
    }

    //getting all the DATA searching by id( using the getById method)
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Refund refund = services.getById(id);
        return refund != null ? ResponseEntity.ok(refund) : ResponseEntity.notFound().build();
    }

    //getting all the DATA searching by status( using the getByStatus method)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Refund>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(services.getByStatus(status.toUpperCase()));
    }

    //getting all the searching by pending( using the getPending method)
    @GetMapping("/pending")
    public ResponseEntity<List<Refund>> getPending() {
        return ResponseEntity.ok(services.getPending());
    }

    //getting all the searching by bookingId( using the getByBooking method)
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Refund>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(services.getByBookingId(bookingId));
    }

    //getting all the searching result( using the search method)
    @GetMapping("/search")
    public ResponseEntity<List<Refund>> search(@RequestParam String q) {
        return ResponseEntity.ok(services.search(q));
    }

    //getting all the DATA searching by stats( using the getStats method)
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(services.getStats());
    }

    //method for calculating all preview calculatePreview calculations
    @GetMapping("/preview")
    public ResponseEntity<?> calculatePreview(
            @RequestParam Long bookingId, 
            @RequestParam String reason) {
        try {
            // Calling the service method we fixed earlier
            return ResponseEntity.ok(services.calculatePreview(bookingId, reason));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiate(@RequestBody InitiateRequest req) {
        try {
            Refund refund = services.initiateRefund(req.getBookingId(), req.getReason(), req.getNotes());
            return ResponseEntity.status(HttpStatus.CREATED).body(refund);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(services.approve(id, name(auth))); }
        catch (RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
    }

    @PatchMapping("/{id}/process")
    public ResponseEntity<?> process(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(services.process(id, name(auth))); }
        catch (RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(services.reject(id, name(auth))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    private String name(Authentication a) { return a != null ? a.getName() : "admin"; }
}
