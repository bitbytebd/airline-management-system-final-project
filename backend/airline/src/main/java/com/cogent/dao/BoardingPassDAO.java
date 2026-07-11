package com.cogent.dao;

import com.cogent.model.BoardingPassRecord;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class BoardingPassDAO {
    @PersistenceContext
    private EntityManager entityManager;

    public List<BoardingPassRecord> getAll() {
        return entityManager.createQuery("FROM BoardingPassRecord p ORDER BY p.issuedAt DESC", BoardingPassRecord.class).getResultList();
    }

    public BoardingPassRecord save(BoardingPassRecord record) {
        entityManager.persist(record);
        return record;
    }
}
