package com.cogent.service;

import com.cogent.model.FlightStatusLog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExternalFlightTrackingProviderService {

    @Value("${tracking.live.provider:${tracking.provider:${flight.tracking.provider:NONE}}}")
    private String provider;

    @Value("${tracking.live.enabled:${tracking.api.enabled:${flight.tracking.enabled:false}}}")
    private boolean enabled;

    @Value("${tracking.live.api-key:${tracking.api.key:${flight.tracking.apiKey:}}}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public boolean canFetch(String aircraftIcao) {
        return isLiveApiMode()
            && StringUtils.hasText(aircraftIcao);
    }

    public Optional<ProviderPosition> fetchLatestPosition(String aircraftIcao) {
        if (!canFetch(aircraftIcao)) {
            return Optional.empty();
        }

        try {
            return fetchFromOpenSky(aircraftIcao.trim().toLowerCase());
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    public void applyLatestPositionIfAvailable(FlightStatusLog log) {
        if (log == null || !StringUtils.hasText(log.getAircraftIcao())) {
            return;
        }

        fetchLatestPosition(log.getAircraftIcao()).ifPresent(position -> {
            log.setCurrentLatitude(position.latitude());
            log.setCurrentLongitude(position.longitude());
            log.setAltitudeFt(position.altitudeFt());
            log.setSpeedKmh(position.speedKmh());
            log.setHeadingDegree(position.headingDegree());
            log.setLastGpsUpdatedAt(position.updatedAt() != null ? position.updatedAt() : LocalDateTime.now());
            log.setTrackingSource(providerName());
        });
    }

    private boolean isLiveApiMode() {
        return enabled && !"NONE".equalsIgnoreCase(provider) && !"SIMULATED".equalsIgnoreCase(provider);
    }

    public String providerName() {
        return StringUtils.hasText(provider) ? provider.trim().toUpperCase() : "LIVE_API";
    }

    private Optional<ProviderPosition> fetchFromOpenSky(String aircraftIcao) throws Exception {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("https://opensky-network.org/api/states/all?icao24=" + aircraftIcao))
            .GET()
            .header("Accept", "application/json");

        if (StringUtils.hasText(apiKey)) {
            requestBuilder.header("Authorization", "Bearer " + apiKey);
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300 || !StringUtils.hasText(response.body())) {
            return Optional.empty();
        }

        List<String> state = firstStateArray(response.body());
        if (state.isEmpty()) {
            return Optional.empty();
        }

        Double longitude = readDouble(state, 5);
        Double latitude = readDouble(state, 6);
        if (latitude == null || longitude == null) {
            return Optional.empty();
        }

        Integer altitudeFt = metersToFeet(readDouble(state, 7));
        Integer speedKmh = metersPerSecondToKmh(readDouble(state, 9));
        Integer headingDegree = readInteger(state, 10);
        LocalDateTime updatedAt = epochToDateTime(readLong(state, 3));

        return Optional.of(new ProviderPosition(latitude, longitude, altitudeFt, speedKmh, headingDegree, updatedAt));
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
            if (c == '"' && (i == 0 || body.charAt(i - 1) != '\\')) {
                inQuote = !inQuote;
            }
            if (!inQuote && c == ']' && body.charAt(i + 1) == ']') {
                return splitJsonArrayValues(body.substring(start, i));
            }
            if (!inQuote && c == ']' && body.charAt(i + 1) == ',') {
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
            if (c == '"' && (i == 0 || row.charAt(i - 1) != '\\')) {
                inQuote = !inQuote;
            }
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

    private String clean(String value) {
        String cleaned = value == null ? "" : value.trim();
        if (cleaned.startsWith("\"") && cleaned.endsWith("\"") && cleaned.length() >= 2) {
            return cleaned.substring(1, cleaned.length() - 1);
        }
        return cleaned;
    }

    private Double readDouble(List<String> values, int index) {
        if (index >= values.size()) return null;
        String value = values.get(index);
        if (!StringUtils.hasText(value) || "null".equalsIgnoreCase(value)) return null;
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

    private Integer metersToFeet(Double meters) {
        return meters == null ? null : (int) Math.round(meters * 3.28084);
    }

    private Integer metersPerSecondToKmh(Double metersPerSecond) {
        return metersPerSecond == null ? null : (int) Math.round(metersPerSecond * 3.6);
    }

    private LocalDateTime epochToDateTime(Long epochSeconds) {
        return epochSeconds == null ? LocalDateTime.now() : LocalDateTime.ofEpochSecond(epochSeconds, 0, ZoneOffset.UTC);
    }

    public record ProviderPosition(
        Double latitude,
        Double longitude,
        Integer altitudeFt,
        Integer speedKmh,
        Integer headingDegree,
        LocalDateTime updatedAt
    ) {}
}
