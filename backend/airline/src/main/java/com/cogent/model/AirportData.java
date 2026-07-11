package com.cogent.model;

import java.util.HashMap;
import java.util.Map;

public class AirportData {

    public static class Airport {
        public double lat;
        public double lon;
        public String city;
        public String country;

        public Airport(double lat, double lon, String city, String country) {
            this.lat = lat;
            this.lon = lon;
            this.city = city;
            this.country = country;
        }
    }

    public static final Map<String, Airport> AIRPORTS = new HashMap<>();

    static {
        // --- Bangladesh Domestic ---
        AIRPORTS.put("DAC", new Airport(23.8433, 90.3978, "Dhaka", "Bangladesh"));
        AIRPORTS.put("CXB", new Airport(21.4528, 91.8086, "Cox's Bazar", "Bangladesh"));
        AIRPORTS.put("CGP", new Airport(22.2497, 91.8156, "Chattagram", "Bangladesh"));
        AIRPORTS.put("JSR", new Airport(23.1833, 89.1667, "Jashore", "Bangladesh"));
        AIRPORTS.put("RJH", new Airport(24.4386, 88.6108, "Rajshahi", "Bangladesh"));
        AIRPORTS.put("SPD", new Airport(25.7725, 88.9464, "Saidpur", "Bangladesh"));
        AIRPORTS.put("ZYL", new Airport(24.9632,91.8668, "Sylhet", "Bangladesh" ));

        // --- International ---
        AIRPORTS.put("DEL", new Airport(28.5562, 77.1000, "Delhi", "India"));
        AIRPORTS.put("BOM", new Airport(19.0896, 72.8656, "Mumbai", "India"));
        AIRPORTS.put("CCU", new Airport(22.6547, 88.4467, "Kolkata", "India"));
        
        AIRPORTS.put("SIN", new Airport(1.3644, 103.9915, "Singapore", "Singapore"));
        AIRPORTS.put("BKK", new Airport(13.6900, 100.7501, "Bangkok", "Thailand"));
        AIRPORTS.put("KUL", new Airport(2.7456, 101.7072, "Kuala Lumpur", "Malaysia"));
        
        AIRPORTS.put("HKG", new Airport(22.3080, 113.9185, "Hong Kong", "Hong Kong"));
        AIRPORTS.put("NRT", new Airport(35.7647, 140.3864, "Tokyo", "Japan"));
        AIRPORTS.put("ICN", new Airport(37.4602, 126.4407, "Seoul", "South Korea"));
        AIRPORTS.put("PEK", new Airport(40.0799, 116.6031, "Beijing", "China"));
        
        AIRPORTS.put("DPS", new Airport(-8.7467, 115.1672, "Bali", "Indonesia"));
        AIRPORTS.put("MLE", new Airport(4.1918, 73.5280, "Male", "Maldives"));
        AIRPORTS.put("CMB", new Airport(7.1808, 79.8841, "Colombo", "Sri Lanka"));
        
        AIRPORTS.put("DXB", new Airport(25.2532, 55.3657, "Dubai", "UAE"));
        AIRPORTS.put("AUH", new Airport(24.4330, 54.6511, "Abu Dhabi", "UAE"));
        AIRPORTS.put("DOH", new Airport(25.2609, 51.6138, "Doha", "Qatar"));
        
        AIRPORTS.put("JED", new Airport(21.6796, 39.1565, "Jeddah", "Saudi Arabia"));
        AIRPORTS.put("RUH", new Airport(24.9576, 46.6988, "Riyadh", "Saudi Arabia"));
        AIRPORTS.put("IST", new Airport(41.2753, 28.7519, "Istanbul", "Turkey"));
        
        AIRPORTS.put("LHR", new Airport(51.4700, -0.4543, "London", "UK"));
        AIRPORTS.put("CDG", new Airport(49.0097, 2.5479, "Paris", "France"));
        AIRPORTS.put("FRA", new Airport(50.0379, 8.5622, "Frankfurt", "Germany"));
        
        AIRPORTS.put("AMS", new Airport(52.3105, 4.7683, "Amsterdam", "Netherlands"));
        AIRPORTS.put("FCO", new Airport(41.8003, 12.2389, "Rome", "Italy"));
        AIRPORTS.put("MAD", new Airport(40.4983, -3.5676, "Madrid", "Spain"));
        
        AIRPORTS.put("ZRH", new Airport(47.4647, 8.5492, "Zurich", "Switzerland"));
        AIRPORTS.put("JFK", new Airport(40.6413, -73.7781, "New York", "USA"));
        AIRPORTS.put("LAX", new Airport(33.9416, -118.4085, "Los Angeles", "USA"));
        AIRPORTS.put("YYZ", new Airport(43.6777, -79.6248, "Toronto", "Canada"));
        AIRPORTS.put("SYD", new Airport(-33.9399, 151.1753, "Sydney", "Australia"));
    }
    
    // Get by Code (e.g., DAC)
    public static Airport getAirport(String code) {
        if(code == null) return null;
        return AIRPORTS.get(code.toUpperCase());
    }
    
    // Get by City Name (e.g., Dhaka) - IMPORTANT FOR CALCULATION
    public static Airport getAirportByCity(String cityName) {
        if (cityName == null) return null;
        for (Airport airport : AIRPORTS.values()) {
            if (airport.city.equalsIgnoreCase(cityName.trim())) {
                return airport;
            }
        }
        return null;
    }
}