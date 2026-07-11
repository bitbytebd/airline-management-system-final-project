package com.cogent.controller;

import com.cogent.model.SpecialAssistanceRequest;
import com.cogent.service.SpecialAssistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/special-assistance")
@CrossOrigin(origins = "http://localhost:4200")

public class SpecialAssistanceController {
      @Autowired
       private  SpecialAssistanceService services;

      @GetMapping
      public  List<SpecialAssistanceRequest> getAll() {
          return services.getAll();
     }

    @PostMapping
    public SpecialAssistanceRequest create(@RequestBody SpecialAssistanceRequest request) {
        return services.create(request);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<SpecialAssistanceRequest> complete(@PathVariable Long id) {
        SpecialAssistanceRequest updated = services.close(id);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/reopen")
    public ResponseEntity<SpecialAssistanceRequest> reopen(@PathVariable Long id) {
        SpecialAssistanceRequest updated = services.reopen(id);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        services.delete(id);
        return ResponseEntity.ok().build();
    }
}
