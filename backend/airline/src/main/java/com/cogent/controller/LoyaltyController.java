package com.cogent.controller;

// ═══════════════════════════════════════════════════════════════════
// FILES: src/main/java/com/cogent/controller/LoyaltyController.java
// USE ( BASE URL : /api/loyalty)
// ═══════════════════════════════════════════════════════════════════

import com.cogent.dto.LoyaltyDTO.*;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.LoyaltyTransaction;
import com.cogent.service.LoyaltyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin(origins = "http://localhost:4200")

public class LoyaltyController {
	 //@AUTOWIRED GIVES ACCESS TO USE FlightService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
    @Autowired
    private LoyaltyService loyaltyService;

    //  GET /api/loyalty FOR All accounts USING getAll  METHOD
    @GetMapping
    public ResponseEntity<List<LoyaltyAccount>> getAll() {
        return ResponseEntity.ok(loyaltyService.getAll());
    }

    //  GET /api/loyalty/stats  USING getStats METHOD
    @GetMapping("/stats")
    public ResponseEntity<LoyaltyStats> getStats() {
        return ResponseEntity.ok(loyaltyService.getStats());
    }

    // GET /api/loyalty/top-earners?limit=10  AND SHOW THIS USING getTopEarners METHOD
    @GetMapping("/top-earners")
    public ResponseEntity<List<LoyaltyAccount>> getTopEarners(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(loyaltyService.getTopEarners(limit));
    }

    //  GET /api/loyalty/tier/{tier}  BY USING getByTier METHOD
    @GetMapping("/tier/{tier}")
    public ResponseEntity<?> getByTier(@PathVariable String tier) {
        try {
            return ResponseEntity.ok(loyaltyService.getByTier(tier));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid tier: " + tier));
        }
    }

    // GET /api/loyalty/search?q=keyword AND SHOW THIS USING search METHOD
    @GetMapping("/search")
    public ResponseEntity<List<LoyaltyAccount>> search(@RequestParam String q) {
        return ResponseEntity.ok(loyaltyService.search(q));
    }

    //  GET /api/loyalty/autocomplete?prefix=Jo AND SHOW THIS USING autocomplete METHOD
    @GetMapping("/autocomplete")
    public ResponseEntity<List<LoyaltyAccount>> autocomplete(@RequestParam String prefix) {
        return ResponseEntity.ok(loyaltyService.autocomplete(prefix));
    }

    //  GET /api/loyalty/{id}AND SHOW THIS USING getById METHOD
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        LoyaltyAccount account = loyaltyService.getById(id);
        return account != null ? ResponseEntity.ok(account) : ResponseEntity.notFound().build();
    }

    // GET /api/loyalty/passenger/{passengerId}AND SHOW THIS USING getByPassenger METHOD
    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<?> getByPassenger(@PathVariable Long passengerId) {
        LoyaltyAccount acc = loyaltyService.getByPassengerId(passengerId);
        if (acc == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No loyalty account for passenger: " + passengerId));
        return ResponseEntity.ok(acc);
    }

    //  GET /api/loyalty/member/{memberNumber}AND SHOW THIS USING getByMemberNumber METHOD
    @GetMapping("/member/{memberNumber}")
    public ResponseEntity<?> getByMemberNumber(@PathVariable String memberNumber) {
        LoyaltyAccount acc = loyaltyService.getByMemberNumber(memberNumber);
        return acc != null ? ResponseEntity.ok(acc) : ResponseEntity.notFound().build();
    }

    // GET /api/loyalty/{id}/transactions AND SHOW THIS USING getTransactions METHOD
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<LoyaltyTransaction>> getTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(loyaltyService.getTransactions(id));
    }

    // ── GET /api/loyalty/passenger/{pid}/transactions AND SHOW THIS USING getTransactionsByPassenger METHOD
    @GetMapping("/passenger/{passengerId}/transactions")
    public ResponseEntity<List<LoyaltyTransaction>> getTransactionsByPassenger(
            @PathVariable Long passengerId) {
        return ResponseEntity.ok(loyaltyService.getTransactionsByPassenger(passengerId));
    }

    //  GET /api/loyalty/{id}/redeem-preview?points=500 AND SHOW THIS USING redeemPreview METHOD
    @GetMapping("/{id}/redeem-preview")
    public ResponseEntity<?> redeemPreview(
            @PathVariable Long id,
            @RequestParam Integer points) {
        try {
            return ResponseEntity.ok(loyaltyService.previewRedemption(id, points));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //  POST /api/loyalty/enroll   AND SHOW THIS USING enroll METHOD
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody EnrollRequest req) {
        try {
            LoyaltyAccount account = loyaltyService.enroll(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(account);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    //  POST /api/loyalty/{id}/award AND SHOW THIS USING award METHOD
    @PostMapping("/{id}/award")
    public ResponseEntity<?> award(
            @PathVariable Long id,
            @RequestBody AwardRequest req,
            Authentication auth) {
        try {
            if (req.getAwardedBy() == null && auth != null) req.setAwardedBy(auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(loyaltyService.awardPoints(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/loyalty/{id}/redeem AND SHOW THIS USING redeem METHOD
    @PostMapping("/{id}/redeem")
    public ResponseEntity<?> redeem(
            @PathVariable Long id,
            @RequestBody RedeemRequest req,
            Authentication auth) {
        try {
            if (req.getRedeemedBy() == null && auth != null) req.setRedeemedBy(auth.getName());
            return ResponseEntity.ok(loyaltyService.redeemPoints(id, req));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    //  POST /api/loyalty/{id}/bonus AND SHOW THIS USING bonus  METHOD
    @PostMapping("/{id}/bonus")
    public ResponseEntity<?> bonus(
            @PathVariable Long id,
            @RequestBody BonusRequest req,
            Authentication auth) {
        try {
            if (req.getAwardedBy() == null && auth != null) req.setAwardedBy(auth.getName());
            return ResponseEntity.ok(loyaltyService.awardBonus(id, req));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    //  PATCH /api/loyalty/{id}/toggle-active AND SHOW THIS USING toggleActive METHOD
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(loyaltyService.toggleActive(id));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}