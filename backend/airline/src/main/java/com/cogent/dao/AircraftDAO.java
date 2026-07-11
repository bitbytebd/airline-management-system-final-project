package com.cogent.dao;

import com.cogent.model.Aircraft;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "aircraftDAO")
@Transactional
public class AircraftDAO {

    @PersistenceContext
    private EntityManager entityManager;

    // COLLECT ALL DATA
    public List<Aircraft> getAll() {
        String hql = "FROM Aircraft";
        return entityManager.createQuery(hql, Aircraft.class).getResultList();
    }

    // GET ALL DATA BY ID
    public Aircraft getById(Long id) {
        return entityManager.find(Aircraft.class, id);
    }

    //  ADD DATA
    @Transactional
    public Aircraft save(Aircraft aircraft) {
        entityManager.persist(aircraft);
        return aircraft;
    }

    //  UPDATE DATA
    @Transactional
    public Aircraft update(Aircraft aircraft) {
        return entityManager.merge(aircraft);
    }

    //  MDELETE DATA
    @Transactional
    public void delete(Long id) {
        Aircraft aircraft = getById(id);
        if (aircraft != null) {
            entityManager.remove(aircraft);
        }
    }
}