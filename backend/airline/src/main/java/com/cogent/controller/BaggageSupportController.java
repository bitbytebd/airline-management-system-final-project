package com.cogent.controller;

import com.cogent.model.BaggageSupportCase;
import com.cogent.service.BaggageSupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

 @RestController
 @RequestMapping("/api/baggage-support")
 @CrossOrigin(origins = "http://localhost:4200")

public class BaggageSupportController {
	
	//creating bean and objects of BaggageSupportService class
    @Autowired
       private  BaggageSupportService services;

    //get information ofBaggageSupportCase using (getAll method)
      @GetMapping
      public List<BaggageSupportCase> getAll() {
        return services.getAll();
    }

      //@PostMapping annotation {create a new  ofBaggageSupportCase using (create method)} and send them safely from client to server
      //@RequestBody(binds JSON REQUEST BODY DATA TO JAVA OBJECT/MAP)
      //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY
      @PostMapping
     public BaggageSupportCase create(@RequestBody BaggageSupportCase baggageCases) {
        return services.create(baggageCases);
    }

    //@PatchMapping  is used for the partial changes or the given fields of (BaggageSupportCase class) like email or password
    @PatchMapping("/{id}/resolve")
    
      public  ResponseEntity<BaggageSupportCase> resolve(@PathVariable Long id) {
         BaggageSupportCase updatedView = services.resolve(id);
           return  updatedView != null ? ResponseEntity.ok(updatedView) : ResponseEntity.notFound().build();
    }

    
    //delete contant( each baggage by catching it's id number)
     @DeleteMapping("/{id}")
     public  ResponseEntity<Void> delete(@PathVariable Long id) {
    	
        return services.delete(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
