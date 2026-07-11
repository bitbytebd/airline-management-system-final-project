package com.cogent.controller;

import com.cogent.model.BoardingPassRecord;
import com.cogent.service.BoardingPassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boarding-passes")
@CrossOrigin(origins = "http://localhost:4200")

   //CONTRILLER MAKES CONNECTION WUTH FRONTEND DIRECTLY

public class BoardingPassController {
	
	 //@AUTOWIRED GIVES ACCESS TO USE BoardingPassService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
	
      @Autowired
      private BoardingPassService services;

      //get the list of results or all result of (BoardingPassRecord) class
     @GetMapping
     public List<BoardingPassRecord> getAll() {
    	 
        return services.getAll();
    }

     //post all BoardingPassRecord of (BoardingPassRecord) class
     @PostMapping
       public BoardingPassRecord issue(@RequestBody BoardingPassRecord records) {
        return services.issue(records);
    }
}
