package com.cogent.service;

import com.cogent.model.Booking;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.LoyaltyTransaction;
import com.cogent.model.Passenger;
import com.cogent.model.Payment;
import com.cogent.service.SmsGatewayService.SmsSendResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service(value = "userPortalService")
public class UserPortalService {

    @Autowired 
    private BookingService bookingServices;
    
    @Autowired
    private PaymentService paymentServices;
    
    @Autowired
    private LoyaltyService loyaltyServices;
    
    @Autowired 
    private PassengerService passengerServices;
    
    @Autowired 
    private SmsGatewayService smsGatewayServices;
    

    private static final int OTP_TTL_MINUTES = 5;
    
    private final Map<String, OtpSession> otpSessions = new ConcurrentHashMap<>();

    public Map<String, Object> sendOtp(String phoneNumber) {
        String normalizedPhone = normalizePhone(phoneNumber);
        
        List<Booking> bookings = findBookingsByPhone(normalizedPhone);
        
        Passenger passenger = findPassengerByPhone(normalizedPhone);
        
        if (bookings.isEmpty() && passenger == null) {
            throw new RuntimeException("No passenger profile was found for this phone number.");
        }

        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        
        otpSessions.put(normalizedPhone, new OtpSession(otp, LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES)));
        
        SmsSendResult smsResult = smsGatewayServices.sendOtp(normalizedPhone, otp);
        
        if (!smsResult.isSent() && !smsResult.isDemoMode()) {
            otpSessions.remove(normalizedPhone);
            throw new RuntimeException(smsResult.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        
        response.put("success", true);
        response.put("message", smsResult.getMessage());
        response.put("maskedPhone", maskPhone(smsResult.getNormalizedPhone()));
        response.put("smsSent", smsResult.isSent());
        response.put("demoMode", smsResult.isDemoMode());
        response.put("expiresInSeconds", OTP_TTL_MINUTES * 60);
        if (smsResult.isDemoMode()) {
            response.put("demoOtp", otp);
        }
        return response;
    }

    public Map<String, Object> verifyOtp(String phoneNumber, String otp) {
    	
        String normalizedPhone = normalizePhone(phoneNumber);
        
        OtpSession session = otpSessions.get(normalizedPhone);
        
        if (session == null || session.expiresAt.isBefore(LocalDateTime.now())) {
            otpSessions.remove(normalizedPhone);
            throw new RuntimeException("OTP expired. Please request a new OTP.");
        }
        if (otp == null || !session.otp.equals(otp.trim())) {
            throw new RuntimeException("Invalid OTP. Please enter the 6 digit code correctly.");
        }

        otpSessions.remove(normalizedPhone);
        return buildDashboard(normalizedPhone);
    }

    public Map<String, Object> accessDashboard(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Enter the phone number or email used in booking.");
        }

        List<Booking> bookings = findBookingsByIdentifier(identifier).stream()
                .sorted(Comparator.comparing(Booking::getDepartureDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        if (!bookings.isEmpty()) {
            return buildDashboardFromBookings(bookings);
        }

        Passenger passenger = findPassengerByIdentifier(identifier);
        if (passenger == null) {
            throw new RuntimeException("No passenger profile was found for this phone number or email.");
        }

        return buildPassengerOnlyDashboard(passenger);
    }

    private Map<String, Object> buildDashboard(String normalizedPhone) {
    	
        List<Booking> bookings = findBookingsByPhone(normalizedPhone).stream()
                .sorted(Comparator.comparing(Booking::getDepartureDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        if (bookings.isEmpty()) {
            Passenger passenger = findPassengerByPhone(normalizedPhone);
            if (passenger == null) {
                throw new RuntimeException("No passenger profile was found for this phone number.");
            }
            return buildPassengerOnlyDashboard(passenger);
        }

        return buildDashboardFromBookings(bookings);
    }

    private Map<String, Object> buildDashboardFromBookings(List<Booking> bookings) {
    	
        Booking latest = bookings.get(0);
        
        List<Payment> payments = new ArrayList<>();
        for (Booking booking : bookings) {
            if (booking.getId() != null) {
                payments.addAll(paymentServices.getByBookingId(booking.getId()));
            }
        }

        
        LoyaltyAccount loyaltyAccount = null;
        
        List<LoyaltyTransaction> loyaltyTransactions = new ArrayList<>();
        
        if (latest.getPassengerId() != null) {
            try {
                loyaltyAccount = loyaltyServices.getByPassengerId(latest.getPassengerId());
                if (loyaltyAccount != null) {
                    loyaltyTransactions = loyaltyServices.getTransactions(loyaltyAccount.getId());
                }
            } catch (Exception ignored) {
                loyaltyAccount = null;
            }
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("passengerId", latest.getPassengerId());
        profile.put("passengerName", latest.getPassengerName());
        profile.put("email", latest.getEmail());
        profile.put("phone", latest.getPhone());
        profile.put("passportNumber", latest.getPassportNumber());

        double totalPaid = payments.stream()
                .filter(payment -> payment.getStatus() != null && "COMPLETED".equals(payment.getStatus().name()))
                .mapToDouble(payment -> payment.getTotalAmount() != null ? payment.getTotalAmount() : 0.0)
                .sum();

        double totalSavings = bookings.stream()
                .mapToDouble(booking -> safeDouble(booking.getCouponDiscount()) + safeDouble(booking.getLoyaltyDiscount()))
                .sum();

        long confirmedBookings = bookings.stream()
                .filter(booking -> booking.getStatus() != null && "CONFIRMED".equalsIgnoreCase(booking.getStatus()))
                .count();

        long upcomingFlights = bookings.stream()
                .filter(booking -> booking.getDepartureDate() != null && !booking.getDepartureDate().isBefore(LocalDate.now()))
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBookings", bookings.size());
        summary.put("confirmedBookings", confirmedBookings);
        summary.put("upcomingFlights", upcomingFlights);
        summary.put("totalPaid", round2(totalPaid));
        summary.put("totalSavings", round2(totalSavings));
        summary.put("loyaltyPoints", loyaltyAccount != null ? loyaltyAccount.getAvailablePoints() : 0);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("profile", profile);
        dashboard.put("summary", summary);
        dashboard.put("latestBooking", latest);
        dashboard.put("bookings", bookings);
        dashboard.put("payments", payments);
        dashboard.put("loyaltyAccount", loyaltyAccount);
        dashboard.put("loyaltyTransactions", loyaltyTransactions);
        return dashboard;
    }

    private List<Booking> findBookingsByIdentifier(String identifier) {
        String normalizedPhone = shouldMatchPhone(identifier) ? normalizePhone(identifier) : "";
        String email = normalizeEmail(identifier);
        return bookingServices.getAllBookings().stream()
                .filter(booking -> (!normalizedPhone.isBlank() && normalizePhone(booking.getPhone()).equals(normalizedPhone))
                        || normalizeEmail(booking.getEmail()).equals(email))
                .collect(Collectors.toList());
    }

    private List<Booking> findBookingsByPhone(String normalizedPhone) {
        return bookingServices.getAllBookings().stream()
                .filter(booking -> normalizePhone(booking.getPhone()).equals(normalizedPhone))
                .collect(Collectors.toList());
    }

    private Passenger findPassengerByPhone(String normalizedPhone) {
        return passengerServices.getAllPassengers().stream()
                .filter(passenger -> normalizePhone(passenger.getPhoneNumber()).equals(normalizedPhone))
                .findFirst()
                .orElse(null);
    }

    private Passenger findPassengerByIdentifier(String identifier) {
        String normalizedPhone = shouldMatchPhone(identifier) ? normalizePhone(identifier) : "";
        String email = normalizeEmail(identifier);
        return passengerServices.getAllPassengers().stream()
                .filter(passenger -> (!normalizedPhone.isBlank() && normalizePhone(passenger.getPhoneNumber()).equals(normalizedPhone))
                        || normalizeEmail(passenger.getEmail()).equals(email))
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> buildPassengerOnlyDashboard(Passenger passenger) {
        LoyaltyAccount loyaltyAccount = null;
        List<LoyaltyTransaction> loyaltyTransactions = new ArrayList<>();
        if (passenger.getId() != null) {
            try {
                loyaltyAccount = loyaltyServices.getByPassengerId(passenger.getId());
                if (loyaltyAccount != null) {
                    loyaltyTransactions = loyaltyServices.getTransactions(loyaltyAccount.getId());
                }
            } catch (Exception ignored) {
                loyaltyAccount = null;
            }
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("passengerId", passenger.getId());
        profile.put("passengerName", ((passenger.getFirstName() != null ? passenger.getFirstName() : "") + " " + (passenger.getLastName() != null ? passenger.getLastName() : "")).trim());
        profile.put("email", passenger.getEmail());
        profile.put("phone", passenger.getPhoneNumber());
        profile.put("passportNumber", passenger.getPassportNumber());

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBookings", 0);
        summary.put("confirmedBookings", 0);
        summary.put("upcomingFlights", 0);
        summary.put("totalPaid", 0.0);
        summary.put("totalSavings", 0.0);
        summary.put("loyaltyPoints", loyaltyAccount != null ? loyaltyAccount.getAvailablePoints() : 0);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("profile", profile);
        dashboard.put("summary", summary);
        dashboard.put("latestBooking", null);
        dashboard.put("bookings", List.of());
        dashboard.put("payments", List.of());
        dashboard.put("loyaltyAccount", loyaltyAccount);
        dashboard.put("loyaltyTransactions", loyaltyTransactions);
        return dashboard;
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        return smsGatewayServices.normalizeForSms(phone);
    }

    private String normalizeEmail(String email) {
        if (email == null) return "";
        return email.trim().toLowerCase();
    }

    private boolean shouldMatchPhone(String identifier) {
        if (identifier == null || identifier.contains("@")) return false;
        return identifier.replaceAll("[^0-9]", "").length() >= 6;
    }

    private String maskPhone(String phone) {
        if (phone.length() <= 4) return "****";
        return "****" + phone.substring(phone.length() - 4);
    }

    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static class OtpSession {
        private final String otp;
        private final LocalDateTime expiresAt;

        private OtpSession(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }
}
