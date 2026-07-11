package com.cogent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service(value = "smsGatewayService")
public class SmsGatewayService {

    @Value("${app.sms.enabled:false}")
    private boolean enabled;

    @Value("${app.sms.api-url:}")
    private String apiUrl;

    @Value("${app.sms.api-token:}")
    private String apiToken;

    @Value("${app.sms.sender-id:Skyward}")
    private String senderId;

    @Value("${app.sms.timeout-seconds:15}")
    private int timeoutSeconds;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public SmsSendResult sendOtp(String phoneNumber, String otp) {
        String normalizedPhone = normalizeForSms(phoneNumber);
        String message = "Your Skyward Airlines OTP is " + otp + ". It will expire in 5 minutes.";

        if (!enabled || apiUrl == null || apiUrl.isBlank()) {
            return SmsSendResult.demo("SMS gateway is not configured. Development OTP is available in the app response.", normalizedPhone);
        }

        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json");

            if (apiToken != null && !apiToken.isBlank()) {
            	builder.header("Authorization", "Bearer " + apiToken);
            }

            String json = "{"
                    + "\"to\":\"" + escapeJson(normalizedPhone) + "\","
                    + "\"message\":\"" + escapeJson(message) + "\","
                    + "\"sender_id\":\"" + escapeJson(senderId) + "\""
                    + "}";

            HttpRequest request = builder.POST(HttpRequest.BodyPublishers.ofString(json)).build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            boolean success = response.statusCode() >= 200 && response.statusCode() < 300;

            if (success) {
                return SmsSendResult.sent("OTP has been sent to the registered phone number.", normalizedPhone);
            }

            return SmsSendResult.failed("SMS gateway rejected the OTP request. Status: " + response.statusCode(), normalizedPhone);
        } catch (IOException | InterruptedException | IllegalArgumentException ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            return SmsSendResult.failed("SMS gateway error: " + ex.getMessage(), normalizedPhone);
        }
    }

    public String normalizeForSms(String phoneNumber) {
        if (phoneNumber == null) return "";
        String digits = phoneNumber.replaceAll("[^0-9+]", "").trim();
        if (digits.startsWith("+880")) return digits;
        if (digits.startsWith("880")) return "+" + digits;
        if (digits.startsWith("0") && digits.length() == 11) return "+88" + digits;
        return digits;
    }

    public String buildUrlEncodedMessage(String phoneNumber, String otp) {
        String message = "Your Skyward Airlines OTP is " + otp + ". It will expire in 5 minutes.";
        return "to=" + URLEncoder.encode(normalizeForSms(phoneNumber), StandardCharsets.UTF_8)
                + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8)
                + "&sender_id=" + URLEncoder.encode(senderId, StandardCharsets.UTF_8);
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public static class SmsSendResult {
        private final boolean sent;
        private final boolean demoMode;
        private final String message;
        private final String normalizedPhone;

        private SmsSendResult(boolean sent, boolean demoMode, String message, String normalizedPhone) {
            this.sent = sent;
            this.demoMode = demoMode;
            this.message = message;
            this.normalizedPhone = normalizedPhone;
        }

        public static SmsSendResult sent(String message, String normalizedPhone) {
            return new SmsSendResult(true, false, message, normalizedPhone);
        }

        public static SmsSendResult demo(String message, String normalizedPhone) {
            return new SmsSendResult(false, true, message, normalizedPhone);
        }

        public static SmsSendResult failed(String message, String normalizedPhone) {
            return new SmsSendResult(false, false, message, normalizedPhone);
        }

        public boolean isSent() { return sent; }
        public boolean isDemoMode() { return demoMode; }
        public String getMessage() { return message; }
        public String getNormalizedPhone() { return normalizedPhone; }
    }
}
