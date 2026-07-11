package com.cogent.controller;
 
import com.cogent.dto.PaymentDTO.PaymentStats;
import com.cogent.dto.PaymentDTO.ProcessExpenseRequest;
import com.cogent.dto.PaymentDTO.ProcessRequest;
import com.cogent.model.Payment;
import com.cogent.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {
	//@AUTOWIRED GIVES ACCESS TO USE FlightService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
    @Autowired private PaymentService services;
 
    
    //getting all the Payment TYPES DATA( using the getAll method)
    @GetMapping
    public ResponseEntity<List<Payment>> getAll() {
        return ResponseEntity.ok(services.getAll());
    }
 
    //getting all the DATA search by using  id( using the getById method)
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Payment payment = services.getById(id);
        return payment != null ? ResponseEntity.ok(payment) : ResponseEntity.notFound().build();
    }
 
    //getting all the status TYPES DATA( using the getByStatus method)
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable String status) {
        try { return ResponseEntity.ok(services.getByStatus(status.toUpperCase())); }
        catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + status)); }
    }
 
    //getting all the method TYPES DATA( using the getByMethod method)
    @GetMapping("/method/{method}")
    public ResponseEntity<?> getByMethod(@PathVariable String method) {
        try { return ResponseEntity.ok(services.getByMethod(method.toUpperCase())); }
        catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("error", "Invalid method")); }
    }
 
    //getting all the getByBooking TYPES DATA searching by using bookingId ( using the getByBooking method)
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(services.getByBookingId(bookingId));
    }
    
    //getting all the FlightStatusLog TYPES DATA( using the getTodays method)
    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<Payment>> getByPassenger(@PathVariable Long passengerId) {
        return ResponseEntity.ok(services.getByPassengerId(passengerId));
    }
 
    //getting all the search all TYPES DATA( using the search method)
    @GetMapping("/search")
    public ResponseEntity<List<Payment>> search(@RequestParam String q) {
        return ResponseEntity.ok(services.search(q));
    }
 
    //getting all the FlightStatusLog  all TYPES DATA( using the getTodays method)
    @GetMapping("/stats")
    public ResponseEntity<PaymentStats> getStats() {
        return ResponseEntity.ok(services.getStats());
    }
 
    //getting all the getMonthlyStats TYPES DATA( using the getMonthlyStats method)
    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Object[]>> getMonthlyStats() {
        return ResponseEntity.ok(services.getMonthlyStats());
    }
 
    //getting all the getMethodBreakdown TYPES DATA( using the getMethodBreakdown method)
    @GetMapping("/method-breakdown")
    public ResponseEntity<List<Object[]>> getMethodBreakdown() {
        return ResponseEntity.ok(services.getMethodBreakdown());
    }
 
    //getting all the process TYPES DATA( using the process method)
    @PostMapping("/process")
    public ResponseEntity<?> process(@RequestBody ProcessRequest req, Authentication auth) {
        try {
            if (req.getProcessedBy() == null && auth != null) req.setProcessedBy(auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(services.processPayment(req));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/process-expense/{expenseId}")
    public ResponseEntity<?> processExpense(@PathVariable Long expenseId, @RequestBody ProcessExpenseRequest req, Authentication auth) {
        try {
            if (req.getProcessedBy() == null && auth != null) req.setProcessedBy(auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(services.processExpensePayment(expenseId, req));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
 
    //getting all the cancel TYPES DATA( using the cancel method)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(services.cancelPayment(id, auth != null ? auth.getName() : "admin")); }
        catch (RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
    }
 
    //getting all the markRefunded TYPES DATA( using the markRefunded method)
    @PatchMapping("/{id}/mark-refunded")
    public ResponseEntity<?> markRefunded(@PathVariable Long id, Authentication auth) {
        try { return ResponseEntity.ok(services.markRefunded(id, auth != null ? auth.getName() : "admin")); }
        catch (RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
    }
}
