package com.cogent.service;

import com.cogent.dao.FlightDAO;
import com.cogent.model.Flight;
import com.cogent.model.AirportData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service(value = "flightService")
@Transactional
public class FlightService {

    @Autowired 
    private FlightDAO flightsDAO;

    public List<Flight> getAllFlights() { 
        return flightsDAO.getAll(); 
    }
    
    public Flight getFlightById(Long id) { 
        return flightsDAO.getById(id); 
    }
    
    public List<Flight> searchFlights(String origin, String destination, String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        return flightsDAO.searchFlights(origin, destination, date);
    }
    
    @Transactional
    public Flight createFlight(Flight f) {
        if (flightsDAO.findByFlightNumber(f.getFlightNumber()) != null) {
            throw new RuntimeException("Flight number '" + f.getFlightNumber() + "' Flight already exists!");
        }
        calculateFlightDetails(f);
        return flightsDAO.save(f); 
    }
    
    @Transactional
    public Flight updateFlight(Long id, Flight details) {
          Flight  existing = flightsDAO.getById(id);
         if (existing != null) {
            if (!existing.getFlightNumber().equals(details.getFlightNumber())) {
                if (flightsDAO.findByFlightNumber(details.getFlightNumber()) != null) {
                    throw new RuntimeException("Flight number '" + details.getFlightNumber() + "' Flight exists!");
                }
            }
            
            existing.setFlightNumber(details.getFlightNumber());
            
            existing.setOrigin(details.getOrigin());
            
            existing.setDestination(details.getDestination());
            
            existing.setDepartureDate(details.getDepartureDate());
            
            existing.setDepartureTime(details.getDepartureTime());
            
            existing.setBasePrice(details.getBasePrice());
            
            existing.setStatus(details.getStatus());

            calculateFlightDetails(existing);
            
            return flightsDAO.update(existing);
        }
        return null;
    }
    
    // MAIN LOGIC: Calculate Distance & Arrival using City Name
    private void calculateFlightDetails(Flight flight) {
        // 1. by using city name
        AirportData.Airport originAp = AirportData.getAirportByCity(flight.getOrigin());
        AirportData.Airport destAp = AirportData.getAirportByCity(flight.getDestination());

        if (originAp != null && destAp != null) {
            // ২. Distance Calculation
            double distance = calculateDistance(originAp.lat, originAp.lon, destAp.lat, destAp.lon);
            flight.setDistance(Math.round(distance * 100.0) / 100.0);

            // ৩. Arrival Calculation
            if (flight.getDepartureDate() != null && flight.getDepartureTime() != null) {
                LocalDateTime departureDateTime = LocalDateTime.of(
                    flight.getDepartureDate(), 
                    flight.getDepartureTime() 
                );

                 double  durationHours = distance / 850.0; // Speed 850km/h
                  long durationMinutes = (long) (durationHours * 60);
                
                 LocalDateTime arrivalDateTime = departureDateTime.plusMinutes(durationMinutes);
                
                  flight.setArrivalDate(arrivalDateTime.toLocalDate());
                  flight.setArrivalTime(arrivalDateTime.toLocalTime());
            }
        } else {
            System.out.println("Warning: Coordinates not found for " + flight.getOrigin() + " or " + flight.getDestination());
        }

        // ৪.class wise  Price Calculation logic
        
        if (flight.getBasePrice() != null) {
              double base = flight.getBasePrice();
              flight.setEconomyPrice(Math.round(base * 1.0 * 100.0) / 100.0);
              flight.setPremiumPrice(Math.round(base * 1.5 * 100.0) / 100.0);
              flight.setBusinessPrice(Math.round(base * 2.5 * 100.0) / 100.0);
              flight.setFirstClassPrice(Math.round(base * 4.0 * 100.0) / 100.0);
        }
    }

    //using longitude and latitude calculate the distance
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; 
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Transactional
    public void deleteFlight(Long id) { 
    	flightsDAO.delete(id); 
    }
}