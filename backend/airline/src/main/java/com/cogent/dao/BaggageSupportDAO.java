package com.cogent.dao;

import com.cogent.model.BaggageSupportCase;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class BaggageSupportDAO {
    @PersistenceContext
    private EntityManager entityManager;

    public List<BaggageSupportCase> getAll() {
        return entityManager.createQuery("FROM BaggageSupportCase c ORDER BY c.createdAt DESC", BaggageSupportCase.class).getResultList();
    }

    public BaggageSupportCase save(BaggageSupportCase baggageCase) {
        entityManager.persist(baggageCase);
        return baggageCase;
    }

    public BaggageSupportCase update(BaggageSupportCase baggageCase) {
        return entityManager.merge(baggageCase);
    }

    public BaggageSupportCase getById(Long id) {
        return entityManager.find(BaggageSupportCase.class, id);
    }

    public void delete(Long id) {
        BaggageSupportCase baggageCase = getById(id);
        if (baggageCase != null) entityManager.remove(baggageCase);
    }
}
