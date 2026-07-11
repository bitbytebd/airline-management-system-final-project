package com.cogent.dao;

import com.cogent.model.Flight;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository(value = "flightDAO")
@Transactional
public class FlightDAO {
	
    @PersistenceContext
    private EntityManager entityManager;

    // 1.total flight list
    public List<Flight> getAll() {
        // HQL Query: Flight 
        return entityManager.createQuery("FROM Flight", Flight.class).getResultList();
    }

    // 2. get by id
    public Flight getById(Long id) {
        return entityManager.find(Flight.class, id);
    }

    //3. (Create)
    @Transactional
    public Flight save(Flight flight) {
        // if there is id, it will get otherwise update
        if (flight.getId() == null) {
            entityManager.persist(flight);
            return flight;
        } else {
            return entityManager.merge(flight);
        }
    }

   
  
    
    
    // 4 (Update)
    @Transactional
    public Flight update(Flight flight) {
        // merge() return update
        return entityManager.merge(flight);
    }

    // 5 (Delete)
    @Transactional
    public void delete(Long id) {
        Flight flight = getById(id);
        if (flight != null) {
            entityManager.remove(flight);
        }
    }
    
    // 6. Find by Flight Number (Duplicate check )
    public Flight findByFlightNumber(String flightNumber) {
        try {
            return entityManager.createQuery("FROM Flight WHERE flightNumber = :fn", Flight.class)
                    .setParameter("fn", flightNumber)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    // 7. Search Flights (Origin, Destination, Date )
    public List<Flight> searchFlights(String origin, String destination, LocalDate date) {
        String hql = "FROM Flight f WHERE f.origin = :origin AND f.destination = :destination AND f.departureDate = :date";
        return entityManager.createQuery(hql, Flight.class)
                .setParameter("origin", origin)
                .setParameter("destination", destination)
                .setParameter("date", date)
                .getResultList();
    }
}