package com.cogent.controller;

import com.cogent.model.Coupon;
import com.cogent.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin("http://localhost:4200")

            //CONTRILLER MAKES CONNECTION WUTH FRONTEND DIRECTLY

public class CouponController {

	 //@AUTOWIRED GIVES ACCESS TO USE CouponService CLASS PROPERTIES AND METHODS WITHOUT CREATING IT'S OBJECT
	
    @Autowired
    private CouponService couponService;

    @GetMapping
    public List<Coupon> getAll(@RequestParam(required = false) String status,
    		
                               @RequestParam(required = false) String q) {
    	
           return couponService.getAll(status, q);
    }
    //get the list of results or all result of (Coupon) class
    @GetMapping("/{id}")
      public  ResponseEntity<Coupon> getById(@PathVariable Long id) {
          Coupon  coupon = couponService.getById(id);
          return  coupon == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(coupon);
    }

    // mapping for creating a new booking using (create method)
    @PostMapping
      public Coupon create(@RequestBody Coupon coupons) {
         return couponService.save(coupons);
    }
//USING TO HANDLE UPDATING FIELDS(USE UPDATE METHOD)
    @PutMapping("/{id}")
      public ResponseEntity<Coupon> update(@PathVariable Long id, @RequestBody Coupon coupons) {
         Coupon  couponUpdated = couponService.update(id, coupons);
         return  couponUpdated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(couponUpdated);
    }

    @DeleteMapping("/{id}")
  //ResponseEntity is the extension of HttpEntity(USED TO CUSTOMIZE HTTP RESPONSE STATUS, HEADERS AND BODY)
 //@PathVariable(EXTRACTS DYNAMIC VALUE FROM URL PATH)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
    	couponService.delete(id);
        return ResponseEntity.ok().build();
    }

    
    //USE GET MAPPING FOR COUPON VALIDATION(WITH REQUIRED FIELDS)
    //HANDLES ALL THE HTTP GET REQUEST FOR FETCHING DATA
    //@RequestParam(BIND QUERY PARAMETER VALUE FROM URL TO METHOD PARAMETER)
    @GetMapping("/validate")
    public Map<String, Object> validate(@RequestParam String code,
    		
                                         @RequestParam Double amount,
                                         
                                         @RequestParam(required = false) String route,
                                         
                                         @RequestParam(required = false) String cabin) {
    	
                  return couponService.validate(code, amount, route, cabin);
    }

    //USE GET MAPPING FOR Map<String, Object>(WITH REQUIRED FIELDS)
    @GetMapping("/stats")
       public  Map<String, Object> stats() {
    	
          return  couponService.stats();
    }
}
