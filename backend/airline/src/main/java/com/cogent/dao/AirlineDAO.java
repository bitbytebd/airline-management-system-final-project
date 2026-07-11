package com.cogent.dao;

import com.cogent.model.Airline;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "airlineDAO")
@Transactional
public class AirlineDAO {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Airline> getAll() {
        return entityManager.createQuery("FROM Airline", Airline.class).getResultList();
    }

    public Airline getById(Long id) {
        return entityManager.find(Airline.class, id);
    }

    @Transactional
    public Airline save(Airline airline) {
        entityManager.persist(airline);
        return airline;
    }

    @Transactional
    public Airline update(Airline airline) {
        return entityManager.merge(airline);
    }

    @Transactional
    public void delete(Long id) {
        Airline airline = getById(id);
        if (airline != null) {
            entityManager.remove(airline);
        }
    }
}