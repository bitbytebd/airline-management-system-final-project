package com.cogent.service;

import com.cogent.dao.BookingDAO;
import com.cogent.dao.FlightDAO;
import com.cogent.dao.PassengerDAO;

import com.cogent.model.Booking;
import com.cogent.model.Coupon;
import com.cogent.model.Flight;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.Passenger;
import com.cogent.dto.LoyaltyDTO.AwardRequest;
import com.cogent.dto.LoyaltyDTO.RedeemRequest;
import com.cogent.dto.FlightReportDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;

import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import java.util.Arrays; 
import com.cogent.dto.SeatMapDTO;

import java.util.List;
import java.util.Random;

   @Service(value = "bookingService")//@Service (Marks this class as a Spring Service component)
  @Transactional    //enables database transaction management
  
    public class BookingService {

	   // injects BookingDAO dependency automatically 
    @Autowired
    private BookingDAO bookingDAO;
    
    // injects FlightDAO dependency automatically 
    @Autowired
    private FlightDAO flightDAO;
    
    // injects PassengerDAO dependency automatically 
    @Autowired
    private PassengerDAO passengerDAO;

    // injects CouponService dependency automatically 
    @Autowired
    private CouponService couponService;

    // injects LoyaltyService dependency automatically 
      @Autowired
       private LoyaltyService loyaltyService;

      @Autowired
       private EmailNotificationService emailNotificationService;

      //RETRIVES COMPLETE Booking LIST FROM DB
    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingDAO.getAll();
        bookings.forEach(this::ensurePassengerLink);
        return bookings;
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingDAO.getByStatus(status);
    }

    public Booking getBookingById(Long id) {
        Booking bookings = bookingDAO.getById(id);
        ensurePassengerLink(bookings);
        return bookings;
    }
   
    public List<Booking> getBookingsByFlightId(Long flightId) {
        return bookingDAO.getBookingsByFlightId(flightId);
    }
    
    public Booking getByReference(String ref) {
    	  Booking bookings = bookingDAO.getByReference(ref);
          ensurePassengerLink(bookings);
          return bookings; }
    
    //these two are working for dashboard
    public Double getTotalSales() {
        return bookingDAO.getTotalSales();
    }

    
    public List<Double> getSalesByPeriod(String period) {
        return bookingDAO.getSalesByPeriod(period);
    }
    
    
    @Transactional
    public Booking createBooking(Booking booking) {
        // use to Generate PNR
        booking.setBookingReference("SKY-" + generateRandomString(6));

        // use to Set Booking Date
        booking.setBookingDate(LocalDate.now());

        // 3. use to Set airline-standard defaults: booking is reviewed before payment/ticketing.
        
        if (isBlank(booking.getStatus())) booking.setStatus("PENDING_REVIEW");
        
        if (isBlank(booking.getPaymentStatus())) booking.setPaymentStatus("PENDING");
        
        if (isBlank(booking.getPaymentMethod())) booking.setPaymentMethod("PENDING");
        
        normalizeBookingDefaults(booking);

        // 4. Fetch and Populate Details (Snapshot)
        Flight flight = flightDAO.getById(booking.getFlightId());
        if (!isFlightBookable(flight)) {
            throw new RuntimeException("This flight is no longer available for booking.");
        }
        if (booking.getDepartureDate() != null
                && flight.getDepartureDate() != null
                && !booking.getDepartureDate().equals(flight.getDepartureDate())) {
            throw new RuntimeException("Selected flight does not match the requested departure date.");
        }
        validateSeatSelectionForBooking(booking, null);
        
        Passenger passenger = resolvePassengerForBooking(booking);

        if (flight != null) {
            booking.setFlightNumber(flight.getFlightNumber());
            
            booking.setOrigin(flight.getOrigin());
            
            booking.setDestination(flight.getDestination());
            
            booking.setDepartureDate(flight.getDepartureDate());

            // Calculate Base Fare
            double baseFare = resolveClassFare(flight, booking.getClassType());
            booking.setBaseFare(baseFare);
            
            applyCommercialAdjustments(booking, baseFare);
            
            // Note: departureTime, arrivalTime, totalDistance will be taken from Frontend input 
            // or you can set them here if Flight entity has these fields.
        }

        if (passenger != null) {
            booking.setPassengerName(passenger.getFirstName() + " " + passenger.getLastName());
            booking.setPassportNumber(passenger.getPassportNumber());
            booking.setEmail(passenger.getEmail());
            booking.setPhone(passenger.getPhoneNumber());
        }

        Booking saved = bookingDAO.save(booking);
        emailNotificationService.sendBookingCreatedEmail(saved);
        return saved;
    }

    private boolean isFlightBookable(Flight flight) {
        if (flight == null || flight.getDepartureDate() == null || flight.getDepartureTime() == null) {
            return false;
        }

        String status = flight.getStatus() == null ? "" : flight.getStatus().trim().toUpperCase();
        if (Arrays.asList("CANCELLED", "LANDED", "DEPARTED", "COMPLETED").contains(status)) {
            return false;
        }

        LocalDateTime departureDateTime = LocalDateTime.of(flight.getDepartureDate(), flight.getDepartureTime());
        return departureDateTime.isAfter(LocalDateTime.now().plusMinutes(30));
    }

    private void validateSeatSelectionForBooking(Booking booking, Long currentBookingId) {
        if (booking == null || booking.getFlightId() == null || isBlank(booking.getSeatNumber())) {
            return;
        }

        List<String> selectedSeats = parseSeatNumbers(booking.getSeatNumber());
        String selectedClass = normalizeCabinClass(booking.getClassType());

        for (String seat : selectedSeats) {
            if (!selectedClass.equals(getCabinClassForSeat(seat))) {
                throw new RuntimeException("Selected seat does not match selected cabin class.");
            }
            if (isSeatAlreadyBlocked(booking.getFlightId(), seat, currentBookingId)) {
                throw new RuntimeException("Seat " + seat + " is already booked or pending for this flight.");
            }
        }
    }

    private List<String> parseSeatNumbers(String seatNumber) {
        List<String> seats = new ArrayList<>();
        if (isBlank(seatNumber)) return seats;
        for (String seat : seatNumber.split(",")) {
            String normalized = seat.trim().toUpperCase();
            if (!normalized.isBlank()) seats.add(normalized);
        }
        return seats;
    }

    private String normalizeCabinClass(String classType) {
        return isBlank(classType) ? "ECONOMY" : classType.trim().toUpperCase();
    }

    private String getCabinClassForSeat(String seatNumber) {
        int row = extractSeatRow(seatNumber);
        if (row >= 1 && row <= 2) return "FIRST_CLASS";
        if (row >= 3 && row <= 5) return "BUSINESS";
        if (row >= 6 && row <= 10) return "PREMIUM";
        if (row >= 11 && row <= 20) return "ECONOMY";
        return "";
    }

    private int extractSeatRow(String seatNumber) {
        if (seatNumber == null) return -1;
        String digits = seatNumber.replaceAll("[^0-9]", "");
        if (digits.isBlank()) return -1;
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException ex) {
            return -1;
        }
    }

    private boolean isSeatAlreadyBlocked(Long flightId, String seatNumber, Long currentBookingId) {
        List<Booking> bookings = bookingDAO.getBookingsByFlightId(flightId);
        for (Booking existing : bookings) {
            if (existing == null || existing.getId() == null) continue;
            if (currentBookingId != null && currentBookingId.equals(existing.getId())) continue;
            if (resolveSeatOccupancyStatus(existing) == null) continue;
            for (String existingSeat : parseSeatNumbers(existing.getSeatNumber())) {
                if (existingSeat.equalsIgnoreCase(seatNumber)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Transactional
    public Booking approveBooking(Long id, String reviewedBy) {
        Booking booking = bookingDAO.getById(id);
        if (booking == null) return null;
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            booking.setStatus("CONFIRMED");
        } else {
            booking.setStatus("APPROVED_FOR_PAYMENT");
            booking.setPaymentStatus("PENDING");
        }
        Booking updated = bookingDAO.update(booking);
        emailNotificationService.sendBookingApprovedEmail(updated);
        return updated;
    }

    @Transactional
    public Booking rejectBooking(Long id, String reviewedBy) {
        Booking booking = bookingDAO.getById(id);
        if (booking == null) return null;
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new RuntimeException("Paid bookings cannot be rejected. Use refund/cancellation workflow.");
        }
        booking.setStatus("REJECTED");
        booking.setPaymentStatus("NOT_REQUIRED");
        return bookingDAO.update(booking);
    }

    @Transactional
    public Booking reopenForReview(Long id) {
        Booking booking = bookingDAO.getById(id);
        if (booking == null) return null;
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new RuntimeException("Paid bookings cannot be moved back to review.");
        }
        booking.setStatus("PENDING_REVIEW");
        booking.setPaymentStatus("PENDING");
        return bookingDAO.update(booking);
    }


    
    
    
    
    @Transactional
    public Booking updateBooking(Long id, Booking details) {

        Booking existing = bookingDAO.getById(id);

        if (existing != null) {

            existing.setPassengerId(details.getPassengerId());
            existing.setFlightId(details.getFlightId());
            existing.setPassengerName(details.getPassengerName());
            existing.setPassportNumber(details.getPassportNumber());
            existing.setEmail(details.getEmail());
            existing.setPhone(details.getPhone());
            Passenger passenger = resolvePassengerForBooking(existing);
            if (passenger != null) {
                existing.setPassengerName((safe(passenger.getFirstName()) + " " + safe(passenger.getLastName())).trim());
                existing.setPassportNumber(passenger.getPassportNumber());
                existing.setEmail(passenger.getEmail());
                existing.setPhone(passenger.getPhoneNumber());
            }

            existing.setClassType(details.getClassType());
            existing.setSeatNumber(details.getSeatNumber());

            existing.setStatus(details.getStatus());
            
            existing.setPaymentStatus(details.getPaymentStatus());
            existing.setPaymentMethod(details.getPaymentMethod());

            existing.setTax(details.getTax());
            
            existing.setDiscount(details.getDiscount());
            
            existing.setCouponCode(details.getCouponCode());
            existing.setCouponDiscount(details.getCouponDiscount() != null ? details.getCouponDiscount() : 0.0);
          
            existing.setLoyaltyMemberNumber(details.getLoyaltyMemberNumber());
            existing.setLoyaltyPointsUsed(details.getLoyaltyPointsUsed() != null ? details.getLoyaltyPointsUsed() : 0);
            existing.setLoyaltyDiscount(details.getLoyaltyDiscount() != null ? details.getLoyaltyDiscount() : 0.0);
            existing.setTripType(details.getTripType());
            existing.setReturnDate(details.getReturnDate());
            existing.setAdultCount(details.getAdultCount());
            existing.setChildCount(details.getChildCount());
            existing.setInfantCount(details.getInfantCount());
            existing.setExtraPassengerNames(details.getExtraPassengerNames());
            existing.setBaggageFee(details.getBaggageFee());
            existing.setSpecialServiceFee(details.getSpecialServiceFee());
            existing.setCheckedBags(details.getCheckedBags());
            existing.setCheckedWeightKg(details.getCheckedWeightKg());
            existing.setCabinWeightKg(details.getCabinWeightKg());
            existing.setSpecialServices(details.getSpecialServices());
            existing.setSpecialServiceNotes(details.getSpecialServiceNotes());
            normalizeBookingDefaults(existing);
            validateSeatSelectionForBooking(existing, existing.getId());

            // Recalculate fare if class changed
            Flight flight = flightDAO.getById(details.getFlightId());

            if (flight != null) {
                double baseFare = resolveClassFare(flight, details.getClassType());

                existing.setBaseFare(baseFare);

                applyCommercialAdjustments(existing, baseFare);
            }

            return bookingDAO.update(existing);
        }

        return existing;
    }

    @Transactional
    public void deleteBooking(Long id) {
        bookingDAO.delete(id);
    }

    @Transactional
    private String generateRandomString(int length) {
          String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
           StringBuilder result = new StringBuilder();
          Random rnd = new Random();
         while (length-- > 0) {
             result.append(chars.charAt(rnd.nextInt(chars.length())));
         }
         return result.toString();
    }

    private void normalizeBookingDefaults(Booking booking) {
        if (booking == null) return;
        booking.setTripType(isBlank(booking.getTripType()) ? "ONE_WAY" : booking.getTripType().trim().toUpperCase());
        if (!"ROUND_TRIP".equalsIgnoreCase(booking.getTripType())) {
            booking.setTripType("ONE_WAY");
            booking.setReturnDate(null);
        }
        booking.setAdultCount(Math.max(booking.getAdultCount() != null ? booking.getAdultCount() : 1, 1));
        booking.setChildCount(Math.max(booking.getChildCount() != null ? booking.getChildCount() : 0, 0));
        booking.setInfantCount(Math.max(booking.getInfantCount() != null ? booking.getInfantCount() : 0, 0));
        if (booking.getTax() == null) booking.setTax(0.0);
        if (booking.getDiscount() == null) booking.setDiscount(0.0);
        if (booking.getCouponDiscount() == null) booking.setCouponDiscount(0.0);
        if (booking.getLoyaltyDiscount() == null) booking.setLoyaltyDiscount(0.0);
        if (booking.getLoyaltyPointsUsed() == null) booking.setLoyaltyPointsUsed(0);
        if (booking.getAdultFareTotal() == null) booking.setAdultFareTotal(0.0);
        if (booking.getChildFareTotal() == null) booking.setChildFareTotal(0.0);
        if (booking.getInfantFareTotal() == null) booking.setInfantFareTotal(0.0);
        if (booking.getPassengerFareTotal() == null) booking.setPassengerFareTotal(0.0);
        if (booking.getBaggageFee() == null) booking.setBaggageFee(0.0);
        if (booking.getSpecialServiceFee() == null) booking.setSpecialServiceFee(0.0);
        if (booking.getSubTotalBeforeDiscount() == null) booking.setSubTotalBeforeDiscount(0.0);
        if (booking.getGrandTotal() == null) booking.setGrandTotal(0.0);
    }

    private double resolveClassFare(Flight flight, String classType) {
        double economy = firstPositive(flight.getEconomyPrice(), flight.getBasePrice(), 0.0);
        String cabin = classType == null ? "ECONOMY" : classType.trim().toUpperCase();
        switch (cabin) {
            case "PREMIUM":
                return round2(firstPositive(flight.getPremiumPrice(), economy * 1.5));
            case "BUSINESS":
                return round2(firstPositive(flight.getBusinessPrice(), economy * 2.5));
            case "FIRST_CLASS":
                return round2(firstPositive(flight.getFirstClassPrice(), economy * 4));
            case "ECONOMY":
            default:
                return round2(economy);
        }
    }

    private double calculateTax(String classType, double passengerFareTotal) {
        String cabin = classType == null ? "ECONOMY" : classType.trim().toUpperCase();
        double taxRate = ("BUSINESS".equals(cabin) || "FIRST_CLASS".equals(cabin)) ? 0.15 : 0.10;
        return round2(passengerFareTotal * taxRate);
    }

    private double firstPositive(Double preferred, double fallback) {
        return preferred != null && preferred > 0 ? preferred : fallback;
    }

    private double firstPositive(Double first, Double second, double fallback) {
        if (first != null && first > 0) return first;
        if (second != null && second > 0) return second;
        return fallback;
    }

    private double amount(Double value) {
        return value != null ? value : 0.0;
    }

    private void applyCommercialAdjustments(Booking booking, double baseFare) {
        normalizeBookingDefaults(booking);

        double adultFareTotal = round2(baseFare * booking.getAdultCount());
        double childFareTotal = round2(baseFare * 0.75 * booking.getChildCount());
        double infantFareTotal = round2(baseFare * 0.10 * booking.getInfantCount());
        double passengerFareTotal = round2(adultFareTotal + childFareTotal + infantFareTotal);
        if ("ROUND_TRIP".equalsIgnoreCase(booking.getTripType())) {
            adultFareTotal = round2(adultFareTotal * 2);
            childFareTotal = round2(childFareTotal * 2);
            infantFareTotal = round2(infantFareTotal * 2);
            passengerFareTotal = round2(passengerFareTotal * 2);
        }

        double manualDiscount = Math.max(amount(booking.getDiscount()) - amount(booking.getCouponDiscount()) - amount(booking.getLoyaltyDiscount()), 0.0);
        double couponDiscount = 0.0;
        double loyaltyDiscount = amount(booking.getLoyaltyDiscount());
        double tax = calculateTax(booking.getClassType(), passengerFareTotal);
        double subtotal = round2(passengerFareTotal + amount(booking.getBaggageFee()) + amount(booking.getSpecialServiceFee()) + tax);

        if (booking.getCouponCode() != null && !booking.getCouponCode().isBlank()) {
            try {
                Map<String, Object> validation = couponService.validate(
                        booking.getCouponCode(),
                        subtotal,
                        booking.getOrigin() + " to " + booking.getDestination(),
                        booking.getClassType());
                if (Boolean.TRUE.equals(validation.get("valid"))) {
                    couponDiscount = ((Number) validation.get("discountAmount")).doubleValue();
                }
            } catch (Exception ignored) { couponDiscount = 0.0; }
        }

        if (booking.getLoyaltyPointsUsed() != null && booking.getLoyaltyPointsUsed() > 0) {
            loyaltyDiscount = round2(booking.getLoyaltyPointsUsed() / 100.0);
        }

        double total = Math.max(subtotal - manualDiscount - couponDiscount - loyaltyDiscount, 0);
        booking.setAdultFareTotal(adultFareTotal);
        booking.setChildFareTotal(childFareTotal);
        booking.setInfantFareTotal(infantFareTotal);
        booking.setPassengerFareTotal(passengerFareTotal);
        booking.setTax(round2(tax));
        booking.setSubTotalBeforeDiscount(subtotal);
        booking.setCouponDiscount(round2(couponDiscount));
        booking.setLoyaltyDiscount(round2(loyaltyDiscount));
        booking.setDiscount(round2(manualDiscount + couponDiscount + loyaltyDiscount));
        booking.setTotalPrice(round2(total));
        booking.setGrandTotal(round2(total));
    }

    @Transactional
    public void finalizeCommercialBenefits(Booking booking, boolean redeemBookingPoints) {
        if (booking.getCouponCode() != null && !booking.getCouponCode().isBlank() && booking.getCouponDiscount() != null && booking.getCouponDiscount() > 0) {
            couponService.recordRedemption(booking.getCouponCode());
        }
        if (booking.getLoyaltyMemberNumber() == null || booking.getLoyaltyMemberNumber().isBlank()) return;
        LoyaltyAccount account = loyaltyService.getByMemberNumber(booking.getLoyaltyMemberNumber());
        if (account == null) return;
        if (redeemBookingPoints && booking.getLoyaltyPointsUsed() != null && booking.getLoyaltyPointsUsed() > 0) {
            try {
                RedeemRequest req = new RedeemRequest();
                req.setPointsToRedeem(booking.getLoyaltyPointsUsed());
                req.setBookingReference(booking.getBookingReference());
                req.setRedeemedBy("booking-module");
                loyaltyService.redeemPoints(account.getId(), req);
            } catch (Exception ignored) {}
        }
        try {
            AwardRequest award = new AwardRequest();
            award.setBookingId(booking.getId());
            award.setBookingReference(booking.getBookingReference());
            award.setFlightNumber(booking.getFlightNumber());
            award.setOrigin(booking.getOrigin());
            award.setDestination(booking.getDestination());
            award.setClassType(booking.getClassType());
            award.setDistanceKm(booking.getTotalDistance());
            award.setDescription("Points awarded from confirmed booking " + booking.getBookingReference());
            loyaltyService.awardPoints(account.getId(), award);
        } catch (Exception ignored) {}
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private Passenger resolvePassengerForBooking(Booking booking) {
        Passenger passenger = null;
        if (booking.getPassengerId() != null && booking.getPassengerId() > 0) {
            passenger = passengerDAO.getById(booking.getPassengerId());
        }
        if (passenger != null) return passenger;
        passenger = passengerDAO.findByPassportNumber(booking.getPassportNumber());
        if (passenger == null) passenger = passengerDAO.findByEmail(booking.getEmail());
        if (passenger == null) passenger = passengerDAO.findByPhoneNumber(booking.getPhone());
        if (passenger != null) {
            booking.setPassengerId(passenger.getId());
            updatePassengerFromBookingSnapshot(passenger, booking);
            return passengerDAO.update(passenger);
        }
        if (isBlank(booking.getPassengerName()) && isBlank(booking.getEmail()) && isBlank(booking.getPhone())) {
            return null;
        }

        Passenger created = new Passenger();
        String fullName = booking.getPassengerName() == null ? "" : booking.getPassengerName().trim();
        String[] parts = fullName.split("\\s+", 2);
        created.setFirstName(parts.length > 0 && !parts[0].isBlank() ? parts[0] : "Passenger");
        created.setLastName(parts.length > 1 ? parts[1] : "");
        created.setEmail(booking.getEmail());
        created.setPhoneNumber(booking.getPhone());
        created.setPassportNumber(isBlank(booking.getPassportNumber()) ? "TEMP-" + generateRandomString(8) : booking.getPassportNumber());
        created.setNationality("Bangladesh");
        created.setGender("Not specified");
        created.setStatus("Active");
        Passenger saved = passengerDAO.save(created);
        booking.setPassengerId(saved.getId());
        return saved;
    }

    private void ensurePassengerLink(Booking booking) {
        if (booking == null) return;
        if (booking.getPassengerId() != null && booking.getPassengerId() > 0
                && passengerDAO.getById(booking.getPassengerId()) != null) {
            return;
        }
        Passenger passenger = resolvePassengerForBooking(booking);
        if (passenger != null && booking.getId() != null) {
            bookingDAO.update(booking);
        }
    }

    private void updatePassengerFromBookingSnapshot(Passenger passenger, Booking booking) {
        if (passenger == null || booking == null) return;
        String fullName = booking.getPassengerName() == null ? "" : booking.getPassengerName().trim();
        if (!fullName.isBlank()) {
            String[] parts = fullName.split("\\s+", 2);
            if (!isBlank(parts[0])) passenger.setFirstName(parts[0]);
            if (parts.length > 1 && !isBlank(parts[1])) passenger.setLastName(parts[1]);
        }
        if (!isBlank(booking.getEmail())) passenger.setEmail(booking.getEmail());
        if (!isBlank(booking.getPhone())) passenger.setPhoneNumber(booking.getPhone());
        if (!isBlank(booking.getPassportNumber())) passenger.setPassportNumber(booking.getPassportNumber());
        if (isBlank(passenger.getStatus())) passenger.setStatus("Active");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // LOGIC 1: Get Flight Seat Report
    @Transactional
    public FlightReportDTO getFlightSeatReport(Long flightId) {
        Flight flight = flightDAO.getById(flightId);
        if (flight == null) throw new RuntimeException("Flight not found");

        // for total seat
        int totalSeats = (flight.getTotalSeats() != null) ? flight.getTotalSeats() : 119;

        Long bookedCount = bookingDAO.countByFlightIdAndStatus(flightId, "CONFIRMED");
        Long pendingCount = bookingDAO.countByFlightIdAndStatuses(
                flightId,
                Arrays.asList("PENDING_REVIEW", "APPROVED_FOR_PAYMENT")
        );
        
        int availableSeats = totalSeats - (bookedCount.intValue() + pendingCount.intValue());

        return new FlightReportDTO(
            flight.getId(), flight.getFlightNumber(), flight.getOrigin(), flight.getDestination(),
            flight.getDepartureDate().toString(),
            totalSeats, bookedCount.intValue(), pendingCount.intValue(), availableSeats
        );
    }

    // LOGIC 2: Search Bookings
    public List<Booking> searchBookings(String query) {
        List<Booking> bookings = bookingDAO.searchByPassengerInfo(query);
        if (bookings != null) bookings.forEach(this::ensurePassengerLink);
        return bookings;
    }

    // LOGIC 3: Generate Seat Map (Matching current cabin row logic)
    public List<SeatMapDTO> getSeatMapForFlight(Long flightId) {
        List<Booking> bookings = bookingDAO.getBookingsByFlightId(flightId);
        
        // map for selected booking
        Map<String, String> bookedSeats = new HashMap<>();
        for (Booking b : bookings) {
            if (b.getSeatNumber() == null || b.getSeatNumber().isBlank()) continue;
            String seatStatus = resolveSeatOccupancyStatus(b);
            if (seatStatus == null) continue;
            for (String seat : b.getSeatNumber().split(",")) {
                String seatNo = seat.trim();
                if (!seatNo.isBlank()) {
                    bookedSeats.put(seatNo, seatStatus);
                }
            }
        }

        List<SeatMapDTO> seatMap = new ArrayList<>();

        // ১. First Class (Rows 1-2): Layout A,B,C,D (Total 8 Seats)
        for (int row = 1; row <= 2; row++) {
            for (String col : Arrays.asList("A", "B", "C", "D")) {
                addSeatToList(seatMap, bookedSeats, row, col);
            }
        }

        // ২. Business Class (Rows 3-5): Layout A,B,C,D,E,F (Total 18 Seats)
        for (int row = 3; row <= 5; row++) {
            for (String col : Arrays.asList("A", "B", "C", "D", "E", "F")) {
                addSeatToList(seatMap, bookedSeats, row, col);
            }
        }

        // ৩. Premium Economy (Rows 6-8): Layout A,B,C,D,E,F,G (Total 21 Seats)
        for (int row = 6; row <= 10; row++) {
            for (String col : Arrays.asList("A", "B", "C", "D", "E", "F", "G")) {
                addSeatToList(seatMap, bookedSeats, row, col);
            }
        }

        // ৪. Economy Class (Rows 9-20): Layout A,B,C,D,E,F (Total 72 Seats)
        for (int row = 11; row <= 20; row++) {
            for (String col : Arrays.asList("A", "B", "C", "D", "E", "F")) {
                addSeatToList(seatMap, bookedSeats, row, col);
            }
        }

        return seatMap;
    }

    // Helper method to avoid code repetition
    private void addSeatToList(List<SeatMapDTO> map, Map<String, String> booked, int row, String col) {
        String seatNo = row + col;
        String status = booked.getOrDefault(seatNo, "AVAILABLE");
        map.add(new SeatMapDTO(seatNo, status));
    }

    private String resolveSeatOccupancyStatus(Booking booking) {
        String status = booking.getStatus() == null ? "" : booking.getStatus().trim().toUpperCase();
        String paymentStatus = booking.getPaymentStatus() == null ? "" : booking.getPaymentStatus().trim().toUpperCase();
        if (Arrays.asList("REJECTED", "CANCELLED", "CANCELED", "REFUNDED").contains(status)
                || Arrays.asList("REFUNDED", "CANCELLED", "CANCELED", "NOT_REQUIRED").contains(paymentStatus)) {
            return null;
        }
        if (Arrays.asList("CONFIRMED", "PAID", "COMPLETED", "TICKETED").contains(status)
                || Arrays.asList("PAID", "COMPLETED", "SUCCESS").contains(paymentStatus)) {
            return "BOOKED";
        }
        if (Arrays.asList("PENDING_REVIEW", "PENDING", "APPROVED_FOR_PAYMENT", "PAYMENT_PENDING").contains(status)
                || Arrays.asList("PENDING", "PAYMENT_PENDING").contains(paymentStatus)) {
            return "PENDING";
        }
        return null;
    }
    
    
 // public List<SeatMapDTO> getSeatMapForFlight(Long flightId) {
        // 
    //  List<Booking> bookings = bookingDAO.getBookingsByFlightId(flightId);

      
    //  Map<String, String> bookedSeats = new HashMap<>();
     // for (Booking b : bookings) {
           
       // if(b.getStatus() != null) {
             //   bookedSeats.put(b.getSeatNumber(), b.getStatus());
         //  }
     // }

        // 
       // List<SeatMapDTO> seatMap = new ArrayList<>();
       // String[] cols = {"A", "B", "C", "D", "E", "F"};
        
       // for (int row = 1; row <= 20; row++) {
           // for (String col : cols) {
               // String seatNo = row + col; 
                // 
              //  String status = bookedSeats.getOrDefault(seatNo, "AVAILABLE");
              //  seatMap.add(new SeatMapDTO(seatNo, status));
          //  }
     //   }
      //  return seatMap;
   // }
}
