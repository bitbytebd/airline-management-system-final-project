package com.cogent.controller;

import com.cogent.service.UserPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user-portal")
@CrossOrigin(origins = "http://localhost:4200")
public class UserPortalController {

     @Autowired 
     private  UserPortalService userPortalServices;
 
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> payload) {
        try {
            return ResponseEntity.ok(userPortalServices.sendOtp(payload.get("phoneNumber")));
        } catch (Exception exe) {
            return error(exe.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        try {
            return ResponseEntity.ok(userPortalServices.verifyOtp(payload.get("phoneNumber"), payload.get("otp")));
        } catch (Exception ee) {
            return error(ee.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/access")
    public ResponseEntity<?> accessDashboard(@RequestBody Map<String, String> payload) {
        try {
            String identifier = payload.get("identifier");
            if (identifier == null) identifier = payload.get("phoneNumber");
            if (identifier == null) identifier = payload.get("email");
            return ResponseEntity.ok(userPortalServices.accessDashboard(identifier));
        } catch (Exception ee) {
            return error(ee.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    private ResponseEntity<Map<String, Object>> error(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
