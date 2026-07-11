package com.cogent.service;

import com.cogent.dao.BookingDAO;
import com.cogent.model.Booking;
import com.cogent.model.FlightStatusLog;
import com.cogent.model.Payment;
import com.cogent.model.Refund;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private BookingDAO bookingDAO;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendBookingCreatedEmail(Booking booking) {
        if (booking == null) return;
        send(
            booking.getEmail(),
            "Booking received - " + safe(booking.getBookingReference()),
            template(
                "Booking Received",
                "Thank you for choosing Skyward Airlines. Your booking has been submitted for review.",
                rows(
                    row("PNR", booking.getBookingReference()),
                    row("Passenger", booking.getPassengerName()),
                    row("Flight", booking.getFlightNumber()),
                    row("Route", route(booking)),
                    row("Status", booking.getStatus()),
                    row("Total", money(booking.getTotalPrice()))
                )
            )
        );
    }

    public void sendBookingApprovedEmail(Booking booking) {
        if (booking == null) return;
        send(
            booking.getEmail(),
            "Booking approved for payment - " + safe(booking.getBookingReference()),
            template(
                "Booking Approved",
                "Your booking has been approved. Please complete payment to confirm your ticket.",
                rows(
                    row("PNR", booking.getBookingReference()),
                    row("Passenger", booking.getPassengerName()),
                    row("Flight", booking.getFlightNumber()),
                    row("Route", route(booking)),
                    row("Payment Status", booking.getPaymentStatus()),
                    row("Amount Due", money(booking.getTotalPrice()))
                )
            )
        );
    }

    public void sendPaymentSuccessEmail(Payment payment, Booking booking) {
        if (payment == null || booking == null) return;
        send(
            booking.getEmail(),
            "Payment confirmed - " + safe(payment.getPaymentReference()),
            template(
                "Payment Confirmed",
                "Your payment has been completed successfully.",
                rows(
                    row("PNR", booking.getBookingReference()),
                    row("Payment Reference", payment.getPaymentReference()),
                    row("Transaction", payment.getTransactionReference()),
                    row("Passenger", booking.getPassengerName()),
                    row("Flight", booking.getFlightNumber()),
                    row("Route", route(booking)),
                    row("Amount", money(payment.getAmount()))
                )
            )
        );
    }

    public void sendTicketIssuedEmail(Booking booking) {
        if (booking == null) return;
        send(
            booking.getEmail(),
            "Ticket issued - " + safe(booking.getBookingReference()),
            template(
                "Ticket Issued",
                "Your ticket or boarding pass has been issued.",
                rows(
                    row("PNR", booking.getBookingReference()),
                    row("Passenger", booking.getPassengerName()),
                    row("Flight", booking.getFlightNumber()),
                    row("Route", route(booking)),
                    row("Seat", booking.getSeatNumber()),
                    row("Status", booking.getStatus())
                )
            )
        );
    }

    public void sendRefundStatusEmail(Refund refund) {
        if (refund == null) return;
        send(
            refund.getPassengerEmail(),
            "Refund update - " + safe(refund.getRefundReference()),
            template(
                "Refund Status Update",
                "Your refund request status has been updated.",
                rows(
                    row("Refund Reference", refund.getRefundReference()),
                    row("PNR", refund.getBookingReference()),
                    row("Passenger", refund.getPassengerName()),
                    row("Flight", refund.getFlightNumber()),
                    row("Route", refund.getFlightRoute()),
                    row("Status", refund.getStatus() != null ? refund.getStatus().name() : null),
                    row("Refund Amount", money(refund.getRefundAmount()))
                )
            )
        );
    }

    public void sendFlightStatusEmail(FlightStatusLog tracking) {
        if (tracking == null || tracking.getFlightId() == null) return;
        List<Booking> bookings = bookingDAO.getBookingsByFlightId(tracking.getFlightId());
        if (bookings == null || bookings.isEmpty()) return;
        for (Booking booking : bookings) {
            send(
                booking.getEmail(),
                "Flight status update - " + safe(tracking.getFlightNumber()),
                template(
                    "Flight Status Update",
                    "There is an operational update for your flight.",
                    rows(
                        row("PNR", booking.getBookingReference()),
                        row("Flight", tracking.getFlightNumber()),
                        row("Route", safe(tracking.getOrigin()) + " to " + safe(tracking.getDestination())),
                        row("Status", tracking.getFlightStatus() != null ? tracking.getFlightStatus().name() : null),
                        row("Gate", tracking.getDepartureGate()),
                        row("Terminal", tracking.getTerminal()),
                        row("Delay", tracking.getDelayMinutes() != null ? tracking.getDelayMinutes() + " min" : "0 min"),
                        row("Note", tracking.getDelayReason())
                    )
                )
            );
        }
    }

    private void send(String to, String subject, String html) {
        if (!StringUtils.hasText(to)) return;
        if (!StringUtils.hasText(mailUsername) || mailSender == null) {
            log.warn("Email notification skipped: SMTP username/password is not configured.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailUsername);
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Email notification failed for {}: {}", to, ex.getMessage());
        }
    }

    private String template(String title, String message, String rows) {
        return """
            <div style="font-family:Arial,sans-serif;background:#f0fbff;padding:24px;color:#0f2f46">
              <div style="max-width:640px;margin:auto;background:#ffffff;border:1px solid #cfeef8;border-radius:16px;overflow:hidden">
                <div style="background:#075985;color:white;padding:20px 24px">
                  <h2 style="margin:0">Skyward Airlines</h2>
                  <p style="margin:6px 0 0">%s</p>
                </div>
                <div style="padding:24px">
                  <h3 style="margin:0 0 10px;color:#075985">%s</h3>
                  <p style="line-height:1.6;margin:0 0 18px">%s</p>
                  <table style="width:100%%;border-collapse:collapse">%s</table>
                  <p style="margin-top:22px;color:#64748b;font-size:12px">This is an automated notification from Skyward Airlines.</p>
                </div>
              </div>
            </div>
            """.formatted(title, title, message, rows);
    }

    private String rows(String... rows) {
        return String.join("", rows);
    }

    private String row(String label, Object value) {
        return "<tr><td style=\"padding:10px;border-bottom:1px solid #e5f5fb;color:#64748b;font-weight:700\">"
                + escape(label) + "</td><td style=\"padding:10px;border-bottom:1px solid #e5f5fb;text-align:right;font-weight:700\">"
                + escape(value == null || !StringUtils.hasText(String.valueOf(value)) ? "N/A" : String.valueOf(value)) + "</td></tr>";
    }

    private String route(Booking booking) {
        return safe(booking.getOrigin()) + " to " + safe(booking.getDestination());
    }

    private String money(Double amount) {
        return "$" + String.format("%.2f", amount != null ? amount : 0.0);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String escape(String value) {
        return value == null ? "" : value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }
}
