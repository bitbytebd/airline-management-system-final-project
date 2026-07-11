package com.cogent.dao;

import com.cogent.model.Passenger;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Repository;
import java.util.List;

@Repository(value = "passengerDAO")
@Transactional
public class PassengerDAO {
	
    @PersistenceContext
    private EntityManager entityManager;

    public List<Passenger> getAll() {
        return entityManager.createQuery("FROM Passenger", Passenger.class).getResultList();
    }

    public Passenger getById(Long id) {
        return entityManager.find(Passenger.class, id);
    }

    public Passenger findByPassportNumber(String passportNumber) {
        if (passportNumber == null || passportNumber.trim().isEmpty()) return null;
        try {
            return entityManager.createQuery(
                    "FROM Passenger p WHERE LOWER(p.passportNumber) = LOWER(:passport)", Passenger.class)
                    .setParameter("passport", passportNumber.trim())
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public Passenger findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return null;
        try {
            return entityManager.createQuery(
                    "FROM Passenger p WHERE LOWER(p.email) = LOWER(:email)", Passenger.class)
                    .setParameter("email", email.trim())
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    public Passenger findByPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) return null;
        try {
            return entityManager.createQuery(
                    "FROM Passenger p WHERE p.phoneNumber = :phone", Passenger.class)
                    .setParameter("phone", phoneNumber.trim())
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public Passenger save(Passenger p) {
        entityManager.persist(p);
        return p;
    }

    @Transactional
    public Passenger update(Passenger p) {
        return entityManager.merge(p);
    }

    @Transactional
    public void delete(Long id) {
        Passenger p = getById(id);
        if (p != null) {
            entityManager.remove(p);
        }
    }
}
