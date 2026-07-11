package com.cogent.model;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "bookings")

public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", unique = true)
    private String bookingReference;

    // Passenger Snapshot
    @Column(name = "passenger_id")
        private Long passengerId;
    
    @Column(name = "passenger_name")
        private String passengerName;
    
    @Column(name = "passport_number")
       private String passportNumber;
    
    private String email;
    private String phone;

    // Flight Snapshot
    @Column(name = "flight_id")
           private Long flightId;
    
    @Column(name = "flight_number")
    private String flightNumber;
    
    private String origin;
    
    private String destination;
    
    @Column(name = "departure_date")
    
    private LocalDate departureDate;

    @Column(name = "trip_type")
    private String tripType = "ONE_WAY";

    @Column(name = "return_date")
    private LocalDate returnDate;
    
    // === NEW FIELDS ADDED ===
    @Column(name = "departure_time")
    private String departureTime; // e.g., "10:30"
    
    @Column(name = "arrival_time")
    private String arrivalTime;   // e.g., "14:45"
    
    @Column(name = "total_distance")
    private Double totalDistance; // e.g., 5000.5 (in KM)
    // ========================

    @Column(name = "class_type")
    private String classType;
    
    @Column(name = "seat_number")
    private String seatNumber;

    @Column(name = "adult_count")
    private Integer adultCount = 1;

    @Column(name = "child_count")
    private Integer childCount = 0;

    @Column(name = "infant_count")
    private Integer infantCount = 0;

    @Column(name = "extra_passenger_names", columnDefinition = "TEXT")
    private String extraPassengerNames;

    // Pricing
    @Column(name = "base_fare")
    private Double baseFare;
    
    private Double tax;
    
    private Double discount;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "coupon_discount")
    private Double couponDiscount;

    @Column(name = "loyalty_member_number")
    private String loyaltyMemberNumber;

    @Column(name = "loyalty_points_used")
    private Integer loyaltyPointsUsed;

    @Column(name = "loyalty_discount")
    private Double loyaltyDiscount;

    @Column(name = "adult_fare_total")
    private Double adultFareTotal = 0.0;

    @Column(name = "child_fare_total")
    private Double childFareTotal = 0.0;

    @Column(name = "infant_fare_total")
    private Double infantFareTotal = 0.0;

    @Column(name = "passenger_fare_total")
    private Double passengerFareTotal = 0.0;

    @Column(name = "baggage_fee")
    private Double baggageFee = 0.0;

    @Column(name = "special_service_fee")
    private Double specialServiceFee = 0.0;

    @Column(name = "sub_total_before_discount")
    private Double subTotalBeforeDiscount = 0.0;
    
    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "grand_total")
    private Double grandTotal = 0.0;

    @Column(name = "checked_bags")
    private Integer checkedBags;

    @Column(name = "checked_weight_kg")
    private Double checkedWeightKg;

    @Column(name = "cabin_weight_kg")
    private Double cabinWeightKg;

    @Column(name = "special_services")
    private String specialServices;

    @Column(name = "special_service_notes")
    private String specialServiceNotes;

    // Payment & Status
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "payment_status")
    private String paymentStatus;
    
    @Column(name = "booking_date")
    private LocalDate bookingDate;
    
    private String status;

    // Default Constructor
    public Booking() {}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getBookingReference() {
		return bookingReference;
	}

	public void setBookingReference(String bookingReference) {
		this.bookingReference = bookingReference;
	}

	public Long getPassengerId() {
		return passengerId;
	}

	public void setPassengerId(Long passengerId) {
		this.passengerId = passengerId;
	}

	public String getPassengerName() {
		return passengerName;
	}

	public void setPassengerName(String passengerName) {
		this.passengerName = passengerName;
	}

	public String getPassportNumber() {
		return passportNumber;
	}

	public void setPassportNumber(String passportNumber) {
		this.passportNumber = passportNumber;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Long getFlightId() {
		return flightId;
	}

	public void setFlightId(Long flightId) {
		this.flightId = flightId;
	}

	public String getFlightNumber() {
		return flightNumber;
	}

	public void setFlightNumber(String flightNumber) {
		this.flightNumber = flightNumber;
	}

	public String getOrigin() {
		return origin;
	}

	public void setOrigin(String origin) {
		this.origin = origin;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public LocalDate getDepartureDate() {
		return departureDate;
	}

	public void setDepartureDate(LocalDate departureDate) {
		this.departureDate = departureDate;
	}

	public String getTripType() {
		return tripType;
	}

	public void setTripType(String tripType) {
		this.tripType = tripType;
	}

	public LocalDate getReturnDate() {
		return returnDate;
	}

	public void setReturnDate(LocalDate returnDate) {
		this.returnDate = returnDate;
	}

	public String getDepartureTime() {
		return departureTime;
	}

	public void setDepartureTime(String departureTime) {
		this.departureTime = departureTime;
	}

	public String getArrivalTime() {
		return arrivalTime;
	}

	public void setArrivalTime(String arrivalTime) {
		this.arrivalTime = arrivalTime;
	}

	public Double getTotalDistance() {
		return totalDistance;
	}

	public void setTotalDistance(Double totalDistance) {
		this.totalDistance = totalDistance;
	}

	public String getClassType() {
		return classType;
	}

	public void setClassType(String classType) {
		this.classType = classType;
	}

	public String getSeatNumber() {
		return seatNumber;
	}

	public void setSeatNumber(String seatNumber) {
		this.seatNumber = seatNumber;
	}

	public Integer getAdultCount() {
		return adultCount;
	}

	public void setAdultCount(Integer adultCount) {
		this.adultCount = adultCount;
	}

	public Integer getChildCount() {
		return childCount;
	}

	public void setChildCount(Integer childCount) {
		this.childCount = childCount;
	}

	public Integer getInfantCount() {
		return infantCount;
	}

	public void setInfantCount(Integer infantCount) {
		this.infantCount = infantCount;
	}

	public String getExtraPassengerNames() {
		return extraPassengerNames;
	}

	public void setExtraPassengerNames(String extraPassengerNames) {
		this.extraPassengerNames = extraPassengerNames;
	}

	public Double getBaseFare() {
		return baseFare;
	}

	public void setBaseFare(Double baseFare) {
		this.baseFare = baseFare;
	}

	public Double getTax() {
		return tax;
	}

	public void setTax(Double tax) {
		this.tax = tax;
	}

	public Double getDiscount() {
		return discount;
	}

	public void setDiscount(Double discount) {
		this.discount = discount;
	}

	public String getCouponCode() {
		return couponCode;
	}

	public void setCouponCode(String couponCode) {
		this.couponCode = couponCode;
	}

	public Double getCouponDiscount() {
		return couponDiscount;
	}

	public void setCouponDiscount(Double couponDiscount) {
		this.couponDiscount = couponDiscount;
	}

	public String getLoyaltyMemberNumber() {
		return loyaltyMemberNumber;
	}

	public void setLoyaltyMemberNumber(String loyaltyMemberNumber) {
		this.loyaltyMemberNumber = loyaltyMemberNumber;
	}

	public Integer getLoyaltyPointsUsed() {
		return loyaltyPointsUsed;
	}

	public void setLoyaltyPointsUsed(Integer loyaltyPointsUsed) {
		this.loyaltyPointsUsed = loyaltyPointsUsed;
	}

	public Double getLoyaltyDiscount() {
		return loyaltyDiscount;
	}

	public void setLoyaltyDiscount(Double loyaltyDiscount) {
		this.loyaltyDiscount = loyaltyDiscount;
	}

	public Double getAdultFareTotal() {
		return adultFareTotal;
	}

	public void setAdultFareTotal(Double adultFareTotal) {
		this.adultFareTotal = adultFareTotal;
	}

	public Double getChildFareTotal() {
		return childFareTotal;
	}

	public void setChildFareTotal(Double childFareTotal) {
		this.childFareTotal = childFareTotal;
	}

	public Double getInfantFareTotal() {
		return infantFareTotal;
	}

	public void setInfantFareTotal(Double infantFareTotal) {
		this.infantFareTotal = infantFareTotal;
	}

	public Double getPassengerFareTotal() {
		return passengerFareTotal;
	}

	public void setPassengerFareTotal(Double passengerFareTotal) {
		this.passengerFareTotal = passengerFareTotal;
	}

	public Double getBaggageFee() {
		return baggageFee;
	}

	public void setBaggageFee(Double baggageFee) {
		this.baggageFee = baggageFee;
	}

	public Double getSpecialServiceFee() {
		return specialServiceFee;
	}

	public void setSpecialServiceFee(Double specialServiceFee) {
		this.specialServiceFee = specialServiceFee;
	}

	public Double getSubTotalBeforeDiscount() {
		return subTotalBeforeDiscount;
	}

	public void setSubTotalBeforeDiscount(Double subTotalBeforeDiscount) {
		this.subTotalBeforeDiscount = subTotalBeforeDiscount;
	}

	public Double getTotalPrice() {
		return totalPrice;
	}

	public void setTotalPrice(Double totalPrice) {
		this.totalPrice = totalPrice;
	}

	public Double getGrandTotal() {
		return grandTotal;
	}

	public void setGrandTotal(Double grandTotal) {
		this.grandTotal = grandTotal;
	}

	public Integer getCheckedBags() {
		return checkedBags;
	}

	public void setCheckedBags(Integer checkedBags) {
		this.checkedBags = checkedBags;
	}

	public Double getCheckedWeightKg() {
		return checkedWeightKg;
	}

	public void setCheckedWeightKg(Double checkedWeightKg) {
		this.checkedWeightKg = checkedWeightKg;
	}

	public Double getCabinWeightKg() {
		return cabinWeightKg;
	}

	public void setCabinWeightKg(Double cabinWeightKg) {
		this.cabinWeightKg = cabinWeightKg;
	}

	public String getSpecialServices() {
		return specialServices;
	}

	public void setSpecialServices(String specialServices) {
		this.specialServices = specialServices;
	}

	public String getSpecialServiceNotes() {
		return specialServiceNotes;
	}

	public void setSpecialServiceNotes(String specialServiceNotes) {
		this.specialServiceNotes = specialServiceNotes;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getPaymentStatus() {
		return paymentStatus;
	}

	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}

	public LocalDate getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDate string) {
		this.bookingDate = string;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
    
    


}
