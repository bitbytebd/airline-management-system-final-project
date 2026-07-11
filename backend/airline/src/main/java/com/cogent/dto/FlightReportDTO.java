package com.cogent.dto;

public class FlightReportDTO {
	    private Long flightId;
	    private String flightNumber;
	    private String origin;
	    private String destination;
	    private String departureDate;
	    
	    private Integer totalSeats;      
	    private Integer bookedSeats;    
	    private Integer pendingSeats;    
	    private Integer availableSeats;
	    
	    
		public FlightReportDTO(Long flightId, String flightNumber, String origin, String destination,
				String departureDate, Integer totalSeats, Integer bookedSeats, Integer pendingSeats,
				Integer availableSeats) {
			super();
			this.flightId = flightId;
			this.flightNumber = flightNumber;
			this.origin = origin;
			this.destination = destination;
			this.departureDate = departureDate;
			this.totalSeats = totalSeats;
			this.bookedSeats = bookedSeats;
			this.pendingSeats = pendingSeats;
			this.availableSeats = availableSeats;
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


		public String getDepartureDate() {
			return departureDate;
		}


		public void setDepartureDate(String departureDate) {
			this.departureDate = departureDate;
		}


		public Integer getTotalSeats() {
			return totalSeats;
		}


		public void setTotalSeats(Integer totalSeats) {
			this.totalSeats = totalSeats;
		}


		public Integer getBookedSeats() {
			return bookedSeats;
		}


		public void setBookedSeats(Integer bookedSeats) {
			this.bookedSeats = bookedSeats;
		}


		public Integer getPendingSeats() {
			return pendingSeats;
		}


		public void setPendingSeats(Integer pendingSeats) {
			this.pendingSeats = pendingSeats;
		}


		public Integer getAvailableSeats() {
			return availableSeats;
		}


		public void setAvailableSeats(Integer availableSeats) {
			this.availableSeats = availableSeats;
		} 
	    
	    

}
