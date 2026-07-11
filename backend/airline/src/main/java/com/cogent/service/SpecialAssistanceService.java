package com.cogent.service;

import com.cogent.dao.SpecialAssistanceDAO;
import com.cogent.model.SpecialAssistanceRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service(value = "specialAssistanceService")
@Transactional
public class SpecialAssistanceService {
    @Autowired private SpecialAssistanceDAO dao;

    public List<SpecialAssistanceRequest> getAll() { return dao.getAll(); }

    public SpecialAssistanceRequest create(SpecialAssistanceRequest request) {
        request.setRequestReference("AST-" + ref());
        if (request.getStatus() == null || request.getStatus().isBlank()) request.setStatus("OPEN");
        return dao.save(request);
    }

    public SpecialAssistanceRequest close(Long id) {
        SpecialAssistanceRequest request = dao.getById(id);
        if (request == null) return null;
        request.setStatus("COMPLETED");
        return dao.update(request);
    }

    public SpecialAssistanceRequest reopen(Long id) {
        SpecialAssistanceRequest request = dao.getById(id);
        if (request == null) return null;
        request.setStatus("OPEN");
        return dao.update(request);
    }

    public void delete(Long id) {
        dao.delete(id);
    }

    private String ref() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 7; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}
