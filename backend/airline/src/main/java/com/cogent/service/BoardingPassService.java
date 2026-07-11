package com.cogent.service;

import com.cogent.dao.BoardingPassDAO;
import com.cogent.dao.BookingDAO;
import com.cogent.model.BoardingPassRecord;
import com.cogent.model.Booking;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service(value = "boardingPassService")  //@Service (Marks this class as a Spring Service component)
@Transactional    //enables database transaction management

public class BoardingPassService {
	  // injects BoardingPassDAO dependency automatically 
    @Autowired 
    private BoardingPassDAO boardingPassDAO;

    @Autowired
    private BookingDAO bookingDAO;

    @Autowired
    private EmailNotificationService emailNotificationService;

    //RETRIVES COMPLETE BoardingPassRecord LIST FROM DB
      public List<BoardingPassRecord> getAll() {
    	    return boardingPassDAO.getAll(); }

      public  BoardingPassRecord issue(BoardingPassRecord record) {
          record.setPassReference("BP-" + ref());
           
          if (record.getStatus() == null || record.getStatus().isBlank()) record.setStatus("ISSUED");
          
          BoardingPassRecord saved = boardingPassDAO.save(record);
          Booking booking = saved.getBookingId() != null ? bookingDAO.getById(saved.getBookingId()) : bookingDAO.getByReference(saved.getBookingReference());
          emailNotificationService.sendTicketIssuedEmail(booking);
          return saved;
    }

    private String ref() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 7; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }
}
