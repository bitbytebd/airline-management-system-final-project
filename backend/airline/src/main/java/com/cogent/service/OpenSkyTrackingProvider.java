package com.cogent.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OpenSkyTrackingProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenSkyTrackingProvider.class);

    @Value("${tracking.live.client-id:${OPENSKY_CLIENT_ID:}}")
    private String clientId;

    @Value("${tracking.live.client-secret:${OPENSKY_CLIENT_SECRET:}}")
    private String clientSecret;

    @Value("${tracking.live.token-url:https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token}")
    private String tokenUrl;

    @Value("${tracking.live.states-url:https://opensky-network.org/api/states/all}")
    private String statesUrl;

    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public Optional<OpenSkyPosition> fetchLatestPosition(String aircraftIcao) {
        if (!StringUtils.hasText(aircraftIcao)) {
            log.info("OpenSky no data, fallback simulated: aircraft ICAO missing");
            return Optional.empty();
        }

        try {
            Optional<String> token = fetchAccessTokenIfConfigured();
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(statesUrl + "?icao24=" + encode(aircraftIcao.trim().toLowerCase())))
                .GET()
                .header("Accept", "application/json");

            token.ifPresent(value -> requestBuilder.header("Authorization", "Bearer " + value));

            HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300 || !StringUtils.hasText(response.body())) {
                log.info("OpenSky no data, fallback simulated: response status {}", response.statusCode());
                return Optional.empty();
            }

            List<String> state = firstStateArray(response.body());
            if (state.isEmpty()) {
                log.info("OpenSky no data, fallback simulated");
                return Optional.empty();
            }

            Double longitude = readDouble(state, 5);
            Double latitude = readDouble(state, 6);
            if (latitude == null || longitude == null) {
                log.info("OpenSky no data, fallback simulated: latitude/longitude missing");
                return Optional.empty();
            }

            boolean onGround = readBoolean(state, 8);
            Integer altitudeFt = onGround ? 0 : metersToFeet(readDouble(state, 7));
            Integer speedKmh = metersPerSecondToKmh(readDouble(state, 9));
            Integer headingDegree = readInteger(state, 10);
            LocalDateTime trackedAt = epochToDateTime(firstLong(readLong(state, 3), readLong(state, 4)));
            String callsign = readText(state, 1);
            String icao24 = readText(state, 0);

            log.info("OpenSky live data found for {}", StringUtils.hasText(icao24) ? icao24 : aircraftIcao);
            return Optional.of(new OpenSkyPosition(
                latitude,
                longitude,
                altitudeFt,
                speedKmh,
                headingDegree,
                StringUtils.hasText(icao24) ? icao24 : aircraftIcao,
                callsign,
                trackedAt
            ));
        } catch (Exception ex) {
            log.info("OpenSky no data, fallback simulated: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private Optional<String> fetchAccessTokenIfConfigured() throws Exception {
        if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret)) {
            log.info("OpenSky credentials missing, using anonymous mode");
            return Optional.empty();
        }

        String body = "grant_type=client_credentials"
            + "&client_id=" + encode(clientId)
            + "&client_secret=" + encode(clientSecret);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(tokenUrl))
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("Accept", "application/json")
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300 || !StringUtils.hasText(response.body())) {
            return Optional.empty();
        }
        return extractJsonString(response.body(), "access_token");
    }

    private List<String> firstStateArray(String body) {
        int statesIndex = body.indexOf("\"states\"");
        if (statesIndex < 0) return List.of();
        int firstArray = body.indexOf("[[", statesIndex);
        if (firstArray < 0) return List.of();

        int start = firstArray + 2;
        boolean inQuote = false;
        for (int i = start; i < body.length() - 1; i++) {
            char c = body.charAt(i);
            if (c == '"' && (i == 0 || body.charAt(i - 1) != '\\')) inQuote = !inQuote;
            if (!inQuote && c == ']' && (body.charAt(i + 1) == ']' || body.charAt(i + 1) == ',')) {
                return splitJsonArrayValues(body.substring(start, i));
            }
        }
        return List.of();
    }

    private List<String> splitJsonArrayValues(String row) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuote = false;
        for (int i = 0; i < row.length(); i++) {
            char c = row.charAt(i);
            if (c == '"' && (i == 0 || row.charAt(i - 1) != '\\')) inQuote = !inQuote;
            if (c == ',' && !inQuote) {
                values.add(clean(current.toString()));
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        values.add(clean(current.toString()));
        return values;
    }

    private Optional<String> extractJsonString(String body, String key) {
        String marker = "\"" + key + "\"";
        int keyIndex = body.indexOf(marker);
        if (keyIndex < 0) return Optional.empty();
        int colon = body.indexOf(':', keyIndex);
        int firstQuote = body.indexOf('"', colon + 1);
        int secondQuote = firstQuote < 0 ? -1 : body.indexOf('"', firstQuote + 1);
        if (firstQuote < 0 || secondQuote < 0) return Optional.empty();
        return Optional.of(body.substring(firstQuote + 1, secondQuote));
    }

    private String clean(String value) {
        String cleaned = value == null ? "" : value.trim();
        if (cleaned.startsWith("\"") && cleaned.endsWith("\"") && cleaned.length() >= 2) {
            return cleaned.substring(1, cleaned.length() - 1).trim();
        }
        return cleaned;
    }

    private String readText(List<String> values, int index) {
        if (index >= values.size()) return "";
        String value = clean(values.get(index));
        return "null".equalsIgnoreCase(value) ? "" : value.trim();
    }

    private Double readDouble(List<String> values, int index) {
        if (index >= values.size()) return null;
        String value = readText(values, index);
        if (!StringUtils.hasText(value)) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Long readLong(List<String> values, int index) {
        Double value = readDouble(values, index);
        return value == null ? null : value.longValue();
    }

    private Integer readInteger(List<String> values, int index) {
        Double value = readDouble(values, index);
        return value == null ? null : (int) Math.round(value);
    }

    private Boolean readBoolean(List<String> values, int index) {
        if (index >= values.size()) return false;
        return Boolean.parseBoolean(readText(values, index));
    }

    private Long firstLong(Long primary, Long fallback) {
        return primary != null ? primary : fallback;
    }

    private Integer metersToFeet(Double meters) {
        return meters == null ? null : (int) Math.round(meters * 3.28084);
    }

    private Integer metersPerSecondToKmh(Double metersPerSecond) {
        return metersPerSecond == null ? null : (int) Math.round(metersPerSecond * 3.6);
    }

    private LocalDateTime epochToDateTime(Long epochSeconds) {
        return epochSeconds == null ? LocalDateTime.now() : LocalDateTime.ofEpochSecond(epochSeconds, 0, ZoneOffset.UTC);
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    public record OpenSkyPosition(
        Double latitude,
        Double longitude,
        Integer altitudeFt,
        Integer speedKmh,
        Integer headingDegree,
        String aircraftIcao,
        String callsign,
        LocalDateTime trackedAt
    ) {}
}
