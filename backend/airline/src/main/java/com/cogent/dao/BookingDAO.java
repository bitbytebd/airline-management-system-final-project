package com.cogent.dao;

import com.cogent.model.Booking;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "bookingDAO")
@Transactional
public class BookingDAO {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Booking> getAll() {
        return entityManager.createQuery("FROM Booking", Booking.class).getResultList();
    }

    public Booking getById(Long id) {
        return entityManager.find(Booking.class, id);
    }
    
    
    public List<Booking> getBookingsByFlightId(Long flightId) {
       
        String sql = "FROM Booking b WHERE b.flightId = :fid";
        return entityManager.createQuery(sql, Booking.class)
                            .setParameter("fid", flightId)
                            .getResultList();
    }

    public List<Booking> getBookingsByPassengerId(Long passengerId) {
        return entityManager.createQuery(
                "FROM Booking b WHERE b.passengerId = :pid ORDER BY b.bookingDate DESC, b.id DESC", Booking.class)
                .setParameter("pid", passengerId)
                .getResultList();
    }

    public Long countByPassengerId(Long passengerId) {
        try {
            return entityManager.createQuery(
                    "SELECT COUNT(b) FROM Booking b WHERE b.passengerId = :pid", Long.class)
                    .setParameter("pid", passengerId)
                    .getSingleResult();
        } catch (Exception e) {
            return 0L;
        }
    }

    public List<Booking> getByStatus(String status) {
        String jpql = "FROM Booking b WHERE UPPER(b.status) = UPPER(:status) ORDER BY b.bookingDate DESC, b.id DESC";
        return entityManager.createQuery(jpql, Booking.class)
                .setParameter("status", status)
                .getResultList();
    }
    
    public Booking getByReference(String ref) {
        try {
            return entityManager.createQuery(
                "FROM Booking b WHERE b.bookingReference = :ref", Booking.class)
                .setParameter("ref", ref)
                .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

 // BookingDAO 
    public List<Double> getSalesByPeriod(String period) {
        String dateCondition = "";
        switch (period) {
            case "daily":
                dateCondition = "STR_TO_DATE(booking_date, '%Y-%m-%d') = CURDATE()";
                break;
            case "weekly":
                dateCondition = "YEARWEEK(STR_TO_DATE(booking_date, '%Y-%m-%d'), 1) = YEARWEEK(CURDATE(), 1)";
                break;
            case "monthly":
                dateCondition = "MONTH(STR_TO_DATE(booking_date, '%Y-%m-%d')) = MONTH(CURDATE()) AND YEAR(STR_TO_DATE(booking_date, '%Y-%m-%d')) = YEAR(CURDATE())";
                break;
            case "6months":
            default:
                dateCondition = "STR_TO_DATE(booking_date, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
                break;
        }

        String sql = "SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE " + dateCondition;
        return entityManager.createNativeQuery(sql).getResultList();
    }
    
    
    public Double getTotalSales() {
        try {
            return (Double) entityManager.createQuery("SELECT SUM(b.totalPrice) FROM Booking b").getSingleResult();
        } catch (Exception e) { return 0.0; }
    }
    
    


    // find by using passenger information
    public List<Booking> searchByPassengerInfo(String name, String email, String phone) {
        String jpql = "FROM Booking b WHERE " +
                      "LOWER(b.passengerName) LIKE LOWER(:name) OR " +
                      "LOWER(b.email) LIKE LOWER(:email) OR " +
                      "b.phone LIKE :phone";
        
        return entityManager.createQuery(jpql, Booking.class)
                .setParameter("name", "%" + name + "%")
                .setParameter("email", "%" + email + "%")
                .setParameter("phone", "%" + phone + "%")
                .getResultList();
    }


    
    // METHOD 1: Count Seats by Status (For Report)
    @Transactional
    public Long countByFlightIdAndStatus(Long flightId, String status) {
        try {
            String jpql = "SELECT COUNT(b) FROM Booking b WHERE b.flightId = :fid AND b.status = :status";
            return (Long) entityManager.createQuery(jpql)
                    .setParameter("fid", flightId)
                    .setParameter("status", status)
                    .getSingleResult();
        } catch (Exception e) {
            return 0L;
        }
    }

    @Transactional
    public Long countByFlightIdAndStatuses(Long flightId, List<String> statuses) {
        try {
            String jpql = "SELECT COUNT(b) FROM Booking b WHERE b.flightId = :fid AND b.status IN :statuses";
            return (Long) entityManager.createQuery(jpql)
                    .setParameter("fid", flightId)
                    .setParameter("statuses", statuses)
                    .getSingleResult();
        } catch (Exception e) {
            return 0L;
        }
    }

    // METHOD 2: Search Passenger Bookings (For Track Booking)
    @Transactional
    public List<Booking> searchByPassengerInfo(String query) {
        try {
            String jpql = "FROM Booking b WHERE " +
                          "LOWER(b.passengerName) LIKE LOWER(:q) OR " +
                          "LOWER(b.email) LIKE LOWER(:q) OR " +
                          "b.phone LIKE :q OR " +
            "LOWER(b.bookingReference) LIKE LOWER(:q)";
            return entityManager.createQuery(jpql, Booking.class)
                    .setParameter("q", "%" + query + "%")
                    .getResultList();
        } catch (Exception e) {
            return null;
        }
    }
    @Transactional
    public Booking save(Booking booking) {
        entityManager.persist(booking);
        return booking;
    }

    @Transactional
    public Booking update(Booking booking) {
        return entityManager.merge(booking);
    }

    @Transactional
    public void delete(Long id) {
        Booking booking = getById(id);
        if (booking != null) {
            entityManager.remove(booking);
        }
    }
}
