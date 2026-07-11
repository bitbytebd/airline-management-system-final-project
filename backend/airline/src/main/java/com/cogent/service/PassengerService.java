package com.cogent.service;

import com.cogent.dao.PassengerDAO;
import com.cogent.dao.BookingDAO;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.Passenger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service(value = "passengerService")
@Transactional
public class PassengerService {
	
    @Autowired
    private PassengerDAO passengerDAO;

    @Autowired
    private BookingDAO bookingDAO;

    @Autowired
    private LoyaltyService loyaltyService;

    public List<Passenger> getAllPassengers() {
        List<Passenger> passengers = passengerDAO.getAll();
        passengers.forEach(this::attachPassengerMetrics);
        return passengers;
    }

    public Passenger getPassengerById(Long id) {
        Passenger passenger = passengerDAO.getById(id);
        if (passenger != null) attachPassengerMetrics(passenger);
        return passenger;
    }

    @Transactional
    public Passenger createPassenger(Passenger p) {
        return passengerDAO.save(p);
    }

    @Transactional
    public Passenger updatePassenger(Long id, Passenger details) {
        Passenger existing = passengerDAO.getById(id);
        if (existing != null) {
            existing.setFirstName(details.getFirstName());
            
            existing.setLastName(details.getLastName());
            
            existing.setPassportNumber(details.getPassportNumber());
            
            existing.setNationality(details.getNationality());
            
            existing.setDateOfBirth(details.getDateOfBirth());
            
            existing.setGender(details.getGender());
            
            existing.setEmail(details.getEmail());
            
            existing.setPhoneNumber(details.getPhoneNumber());
            
            existing.setAddress(details.getAddress());
            
            existing.setFrequentFlyerNo(details.getFrequentFlyerNo());
            
            existing.setMealPreference(details.getMealPreference());
            
            existing.setStatus(details.getStatus());
            
            return passengerDAO.update(existing);
        }
        return null;
    }

    @Transactional
    public void deletePassenger(Long id) {
        passengerDAO.delete(id);
    }

    private void attachPassengerMetrics(Passenger passenger) {
        if (passenger == null || passenger.getId() == null) return;
        passenger.setTotalBookings(bookingDAO.countByPassengerId(passenger.getId()));
        try {
            LoyaltyAccount account = loyaltyService.getByPassengerId(passenger.getId());
            passenger.setLoyaltyPoints(account != null ? account.getAvailablePoints() : 0);
        } catch (Exception e) {
            passenger.setLoyaltyPoints(0);
        }
    }
}
