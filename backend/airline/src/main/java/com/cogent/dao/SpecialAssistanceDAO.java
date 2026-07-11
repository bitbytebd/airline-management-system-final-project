package com.cogent.dao;

import com.cogent.model.SpecialAssistanceRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class SpecialAssistanceDAO {
    @PersistenceContext
    private EntityManager entityManager;

    public List<SpecialAssistanceRequest> getAll() {
        return entityManager.createQuery("FROM SpecialAssistanceRequest r ORDER BY r.createdAt DESC", SpecialAssistanceRequest.class).getResultList();
    }

    public SpecialAssistanceRequest save(SpecialAssistanceRequest request) {
        entityManager.persist(request);
        return request;
    }

    public SpecialAssistanceRequest update(SpecialAssistanceRequest request) {
        return entityManager.merge(request);
    }

    public SpecialAssistanceRequest getById(Long id) {
        return entityManager.find(SpecialAssistanceRequest.class, id);
    }

    public void delete(Long id) {
        SpecialAssistanceRequest request = getById(id);
        if (request != null) {
            entityManager.remove(request);
        }
    }
}
