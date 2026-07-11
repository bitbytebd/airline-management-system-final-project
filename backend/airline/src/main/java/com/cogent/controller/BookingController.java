package com.cogent.controller;

import com.cogent.model.Booking;
import com.cogent.service.BookingService;

import com.cogent.dto.SeatMapDTO;
import com.cogent.dto.FlightReportDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
   
         //make direct connection with frontend
   public class BookingController {

	 //@AUTOWIRED GIVES ACCESS TO USE BookingService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
	
    @Autowired
    private BookingService bookingServices;

    //get all the bookings or booking list
      @GetMapping
     public  List<Booking> getAll() { 
    	 return  bookingServices.getAllBookings(); }

      //getting all the bookings( using the getByStatus method)
      
     @GetMapping("/status/{status}")
     public List<Booking> getByStatus(@PathVariable String status) {
        return bookingServices.getBookingsByStatus(status);
    }

     // mapping for creating a new booking using (create method)
     //@RequestBody(bind all http post request with specific method
     
    @PostMapping
    public Booking create(@RequestBody Booking newBooking) {
    	 return bookingServices.createBooking(newBooking); }

    //GET THE BOOKING USING THEIR ( ID NUMBER )
    @GetMapping("/{id}")
      public ResponseEntity<Booking> getById(@PathVariable Long id) {
          Booking booking = bookingServices.getBookingById(id);
           return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
    }

    
    //GET THE BOOKING USING THEIR ( getByRef NUMBER )
     @GetMapping("/ref/{ref}")
   //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
       public ResponseEntity<Booking> getByRef(@PathVariable("ref") String referrence) {
           Booking booking = bookingServices.getByReference(referrence);
           return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
    }
    
    //get all the seat mapp using (getSeatMap method)
    @GetMapping("/flight/{flightId}/seats")
       public List<SeatMapDTO> getSeatMap(@PathVariable("flightId") Long flightIdNum) {
          return bookingServices.getSeatMapForFlight(flightIdNum);
    }
    
    
    //update the fields (by catching id)
    
    @PutMapping("/{id}")
  //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
    //@PathVariable(EXTRACTS DYNAMIC VALUE FROM URL PATH)
    
    public ResponseEntity<Booking> update(@PathVariable Long id, @RequestBody Booking booking) {
    	
    	
    	System.out.println(booking.getPassengerName());
    	
    	
        Booking updated = bookingServices.updateBooking(id, booking);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    
    @PatchMapping("/{id}/approve")
  //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
    //@PathVariable(EXTRACTS DYNAMIC VALUE FROM URL PATH)
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        Booking updated = bookingServices.approveBooking(id, auth != null ? auth.getName() : "admin");
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/reject")
  //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
    //@PathVariable(EXTRACTS DYNAMIC VALUE FROM URL PATH)
  
    public ResponseEntity<?> reject(@PathVariable Long id, Authentication auth) {
        try {
            Booking updated = bookingServices.rejectBooking(id, auth != null ? auth.getName() : "admin");
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reopen-review")
  //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
   //RETURNS CUSTOM http RESPONSES WITH SPECIFIC REQUIRED FIELDS 
    public ResponseEntity<?> reopenForReview(@PathVariable Long id) {
        try {
            Booking updated = bookingServices.reopenForReview(id);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
   //tracking the bookings of the passengers (endpoint : trackbooking)
    @GetMapping("/search")
    public List<Booking> searchBookings(@RequestParam("q") String query) {
        return bookingServices.searchBookings(query);
    }

    //tracking the getFlightReport of the passengers (endpoint : getFlightReport)
    //@PathVariable(EXTRACTS DYNAMIC VALUES FOR THE URL PATH)
      @GetMapping("/report/{flightId}")
      public ResponseEntity<FlightReportDTO> getFlightReport(@PathVariable Long flightId) {
        return ResponseEntity.ok(bookingServices.getFlightSeatReport(flightId));
       }
    
    //getting the getBookingsByFlight of the passengers (endpoint : getBookingsByFlight)
      //@PathVariable(EXTRACTS DYNAMIC VALUES FOR THE URL PATH)
    @GetMapping("/flight/{flightId}/list")
    
     public List<Booking> getBookingsByFlight(@PathVariable Long flightId) {
        return  bookingServices.getBookingsByFlightId(flightId);
    }
 
    //delete content( each bookings by catching it's id number)
    
    @DeleteMapping("/{id}")
      public ResponseEntity<Void> delete(@PathVariable Long id) {
    	bookingServices.deleteBooking(id);
         return ResponseEntity.ok().build();
    }
}
