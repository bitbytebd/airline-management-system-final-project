package com.cogent.dto;

public class SeatMapDTO {
	  private String seatNumber;
	    private String status; // AVAILABLE, BOOKED, PENDING

	    // Constructor
	    public SeatMapDTO(String seatNumber, String status) {
	        this.seatNumber = seatNumber;
	        this.status = status;
	    }

	    // Getters and Setters
	    public String getSeatNumber() { 
	    	   return seatNumber; }
	    
	    public void setSeatNumber(String seatNumber) {
	    	    this.seatNumber = seatNumber; }
	    
	    public String getStatus() {
	    	       return status; }
	    
	    public void setStatus(String status) { 
	    	      this.status = status; }

}
