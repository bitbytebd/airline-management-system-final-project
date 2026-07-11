package com.cogent.controller;

import com.cogent.model.WaitlistEntry;
import com.cogent.service.WaitlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin("http://localhost:4200")//allows angular frontend to backend APIs
public class WaitlistController {

	//injects WaitlistService dependency automatically
    @Autowired
    private WaitlistService services;

    //getAll waitlist entries
    @GetMapping
    public List<WaitlistEntry> getAll(@RequestParam(required = false) String status,
                                      @RequestParam(required = false) String q) {
        return services.getAll(status, q);
    }

    //single waitlist entry by id
    @GetMapping("/{id}")
    public ResponseEntity<WaitlistEntry> getById(@PathVariable Long id) {
        WaitlistEntry entry = services.getById(id);
        return entry == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(entry);
    }

    //receives JSON requestbody from frontend
    //create new WAITLIST entry
    @PostMapping
    public WaitlistEntry create(@RequestBody WaitlistEntry entry) {
        return services.create(entry);
    }

  //update new WAITLIST entry by id
    @PutMapping("/{id}")
    public ResponseEntity<WaitlistEntry> update(@PathVariable Long id, @RequestBody WaitlistEntry entry) {
        WaitlistEntry updated = services.update(id, entry);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }
    //delete  WAITLIST entry by id
     @DeleteMapping("/{id}")
      public  ResponseEntity<Void> delete(@PathVariable Long id) {
          services.delete(id);
         return  ResponseEntity.ok().build();
    }

     //NOTIFY PASSENGER ABOUT AVAILABLE SEAT 
     @PatchMapping("/{id}/notify")
     public  WaitlistEntry notifyPassenger(@PathVariable Long id) {
        return  services.notifyPassenger(id);
    }

     //CONFIRM WAITLIST PASSENGER BOOKING
    @PatchMapping("/{id}/confirm")
     public  WaitlistEntry confirm(@PathVariable Long id) {
        return  services.confirm(id);
    }

    //CANCELL WAITLIST ENTRY
    @PatchMapping("/{id}/cancel")
     public  WaitlistEntry cancel(@PathVariable Long id) {
        return  services.cancel(id);
    }

    // GET WAITLIST STATISTICS(TOTAL Pending, Confirmed, Cancelled)
    @GetMapping("/stats")
     public  Map<String, Object> stats() {
        return  services.stats();
    }

    //GET ALL OVERBOOKING SUMMARY REPORT
    @GetMapping("/overbooking-summary")
     public  List<Object[]> overbookingSummary() {
         return  services.overbookingSummary();
    }
}
