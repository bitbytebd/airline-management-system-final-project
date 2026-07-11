package com.cogent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LiveAircraftTrackingService {

    private static final Logger log = LoggerFactory.getLogger(LiveAircraftTrackingService.class);

    private final OpenSkyTrackingProvider openSkyTrackingProvider;

    @Value("${tracking.live.enabled:false}")
    private boolean enabled;

    @Value("${tracking.live.provider:NONE}")
    private String provider;

    public LiveAircraftTrackingService(OpenSkyTrackingProvider openSkyTrackingProvider) {
        this.openSkyTrackingProvider = openSkyTrackingProvider;
    }

    public Optional<LiveAircraftPosition> fetchLatestPosition(String aircraftIcao) {
        if (!canRequestLivePosition(aircraftIcao)) {
            if (!enabled) log.info("OpenSky API disabled, fallback simulated");
            return Optional.empty();
        }

        try {
            if (!"OPENSKY".equalsIgnoreCase(provider)) {
                log.info("OpenSky no data, fallback simulated: unsupported provider {}", provider);
                return Optional.empty();
            }
            return openSkyTrackingProvider.fetchLatestPosition(aircraftIcao)
                .filter(position -> position.latitude() != null && position.longitude() != null)
                .map(position -> new LiveAircraftPosition(
                    position.latitude(),
                    position.longitude(),
                    position.altitudeFt(),
                    position.speedKmh(),
                    position.headingDegree(),
                    StringUtils.hasText(position.callsign()) ? "OPENSKY " + position.callsign().trim() : "OPENSKY",
                    position.trackedAt() != null ? position.trackedAt() : LocalDateTime.now()
                ));
        } catch (Exception ex) {
            log.info("OpenSky no data, fallback simulated: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private boolean canRequestLivePosition(String aircraftIcao) {
        return enabled
            && StringUtils.hasText(aircraftIcao)
            && StringUtils.hasText(provider)
            && !"NONE".equalsIgnoreCase(provider)
            && !"SIMULATED".equalsIgnoreCase(provider);
    }

    public record LiveAircraftPosition(
        Double latitude,
        Double longitude,
        Integer altitudeFt,
        Integer speedKmh,
        Integer headingDegree,
        String source,
        LocalDateTime trackedAt
    ) {}
}
