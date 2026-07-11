package com.cogent.dto;

public class BoardingPassDTO {
    private String passengerName;
    private String flightNumber;
    private String origin;
    private String destination;
    private String departureDate;
    private String departureTime;
    private String seatNumber;
    private String classType;
    private String pnr; // Booking Reference
    private String gate; // Dynamic Gate
    private String terminal; 
    private String boardingTime; // Usually 45 mins before departure

    // Constructors, Getters and Setters
    public BoardingPassDTO() {}

    // All Args Constructor for easy mapping
    public BoardingPassDTO(String passengerName, String flightNumber, String origin, String destination, 
                           String departureDate, String departureTime, String seatNumber, 
                           String classType, String pnr) {
        this.passengerName = passengerName;
        this.flightNumber = flightNumber;
        this.origin = origin;
        this.destination = destination;
        this.departureDate = departureDate;
        this.departureTime = departureTime;
        this.seatNumber = seatNumber;
        this.classType = classType;
        this.pnr = pnr;
        // Auto Calculate Logic for Demo
        this.gate = "G-" + (int)(Math.random() * 20 + 1);
        this.terminal = "T-" + (origin.equals("DAC") ? "1" : "2");
        this.boardingTime = calculateBoardingTime(departureTime);
    }

    private String calculateBoardingTime(String depTime) {
        // Simple logic to subtract 45 mins (Needs proper Time API in real app)
        return depTime; // For simplicity returning same, implement logic if needed
    }

    // Getters and Setters...
    public String getPassengerName() {
    	return passengerName; }
    
    public void setPassengerName(String passengerName) { 
    	this.passengerName = passengerName; }
    
    public String getFlightNumber() {
    	       return flightNumber; }
    
    public void setFlightNumber(String flightNumber) {
    	          this.flightNumber = flightNumber; }
    
    public String getOrigin() { 
    	           return origin; }
    
    public void setOrigin(String origin) {
    	            this.origin = origin; }
    
    public String getDestination() {
    	              return destination; }
    
    public void setDestination(String destination) {
    	                  this.destination = destination; }
    
    public String getDepartureDate() { 
    	              return departureDate; }
    
    public void setDepartureDate(String departureDate) {
    	                this.departureDate = departureDate; }
    
    public String getDepartureTime() { 
    	             return departureTime; }
    
    public void setDepartureTime(String departureTime) {
    	             this.departureTime = departureTime; }
    
    public String getSeatNumber() { 
    	                return seatNumber; }
    
    public void setSeatNumber(String seatNumber) {
    	this.seatNumber = seatNumber; }
    
    public String getClassType() {
    	return classType; }
    
    public void setClassType(String classType) {
    	this.classType = classType; }
    
    public String getPnr() {
    	return pnr; }
    
    public void setPnr(String pnr) { 
    	this.pnr = pnr; }
    
    public String getGate() {
    	return gate; }
    
    public void setGate(String gate) {
    	this.gate = gate; }
    
    public String getTerminal() { 
    	return terminal; }
    
    public void setTerminal(String terminal) { 
    	this.terminal = terminal; }
    
    public String getBoardingTime() { 
    	return boardingTime; }
    
    public void setBoardingTime(String boardingTime) { 
    	this.boardingTime = boardingTime; }
}