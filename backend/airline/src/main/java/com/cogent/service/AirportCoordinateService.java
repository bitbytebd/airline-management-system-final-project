package com.cogent.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AirportCoordinateService {

    private final List<AirportCoordinate> airports = List.of(
        airport("Dhaka", "Bangladesh", "Hazrat Shahjalal International Airport", "DAC", 23.8433, 90.3978, "Shahjalal", "Dhaka Airport"),
        airport("Chattogram", "Bangladesh", "Shah Amanat International Airport", "CGP", 22.2496, 91.8133, "Chittagong", "Chattogram Airport"),
        airport("Sylhet", "Bangladesh", "Osmani International Airport", "ZYL", 24.9632, 91.8668, "Sylhet Airport"),
        airport("Cox's Bazar", "Bangladesh", "Cox's Bazar Airport", "CXB", 21.4522, 91.9639, "Cox Bazar"),
        airport("Rajshahi", "Bangladesh", "Shah Makhdum Airport", "RJH", 24.4372, 88.6165, "Rajshahi Airport"),
        airport("Saidpur", "Bangladesh", "Saidpur Airport", "SPD", 25.7592, 88.9089),
        airport("Jashore", "Bangladesh", "Jashore Airport", "JSR", 23.1838, 89.1608, "Jessore"),
        airport("Barishal", "Bangladesh", "Barishal Airport", "BZL", 22.8010, 90.3012, "Barisal"),

        airport("Doha", "Qatar", "Hamad International Airport", "DOH", 25.2731, 51.6081, "Hamad"),
        airport("Dubai", "United Arab Emirates", "Dubai International Airport", "DXB", 25.2532, 55.3657),
        airport("Abu Dhabi", "United Arab Emirates", "Zayed International Airport", "AUH", 24.4330, 54.6511, "Abu Dhabi International"),
        airport("Muscat", "Oman", "Muscat International Airport", "MCT", 23.5933, 58.2844),
        airport("Kuwait", "Kuwait", "Kuwait International Airport", "KWI", 29.2266, 47.9689, "Kuwait City"),
        airport("Riyadh", "Saudi Arabia", "King Khalid International Airport", "RUH", 24.9576, 46.6988),
        airport("Jeddah", "Saudi Arabia", "King Abdulaziz International Airport", "JED", 21.6796, 39.1565),
        airport("Bahrain", "Bahrain", "Bahrain International Airport", "BAH", 26.2708, 50.6336, "Manama"),

        airport("Singapore", "Singapore", "Singapore Changi Airport", "SIN", 1.3644, 103.9915, "Changi"),
        airport("Kuala Lumpur", "Malaysia", "Kuala Lumpur International Airport", "KUL", 2.7456, 101.7072, "KLIA"),
        airport("Bangkok", "Thailand", "Suvarnabhumi Airport", "BKK", 13.6900, 100.7501, "Suvarnabhumi"),
        airport("Delhi", "India", "Indira Gandhi International Airport", "DEL", 28.5562, 77.1000, "New Delhi"),
        airport("Kolkata", "India", "Netaji Subhas Chandra Bose International Airport", "CCU", 22.6547, 88.4467, "Calcutta"),
        airport("Mumbai", "India", "Chhatrapati Shivaji Maharaj International Airport", "BOM", 19.0896, 72.8656, "Bombay"),
        airport("Chennai", "India", "Chennai International Airport", "MAA", 12.9941, 80.1709, "Madras"),
        airport("Bengaluru", "India", "Kempegowda International Airport", "BLR", 13.1986, 77.7066, "Bangalore"),
        airport("Karachi", "Pakistan", "Jinnah International Airport", "KHI", 24.9065, 67.1608),
        airport("Islamabad", "Pakistan", "Islamabad International Airport", "ISB", 33.5490, 72.8257),
        airport("Lahore", "Pakistan", "Allama Iqbal International Airport", "LHE", 31.5216, 74.4036),
        airport("Kathmandu", "Nepal", "Tribhuvan International Airport", "KTM", 27.6966, 85.3591),
        airport("Colombo", "Sri Lanka", "Bandaranaike International Airport", "CMB", 7.1808, 79.8841),
        airport("Male", "Maldives", "Velana International Airport", "MLE", 4.1918, 73.5291, "Malé"),
        airport("Jakarta", "Indonesia", "Soekarno-Hatta International Airport", "CGK", -6.1256, 106.6559),
        airport("Manila", "Philippines", "Ninoy Aquino International Airport", "MNL", 14.5086, 121.0194),
        airport("Tokyo", "Japan", "Tokyo Haneda Airport", "HND", 35.5494, 139.7798, "Haneda"),
        airport("Tokyo", "Japan", "Narita International Airport", "NRT", 35.7719, 140.3929, "Narita"),
        airport("Seoul", "South Korea", "Incheon International Airport", "ICN", 37.4602, 126.4407, "Incheon"),
        airport("Beijing", "China", "Beijing Capital International Airport", "PEK", 40.0799, 116.6031, "Capital Airport"),
        airport("Shanghai", "China", "Shanghai Pudong International Airport", "PVG", 31.1443, 121.8083, "Pudong"),
        airport("Hong Kong", "Hong Kong", "Hong Kong International Airport", "HKG", 22.3080, 113.9185),
        airport("Guangzhou", "China", "Guangzhou Baiyun International Airport", "CAN", 23.3924, 113.2988, "Baiyun"),

        airport("London", "United Kingdom", "Heathrow Airport", "LHR", 51.4700, -0.4543, "London Heathrow", "Heathrow"),
        airport("London", "United Kingdom", "Gatwick Airport", "LGW", 51.1537, -0.1821, "London Gatwick", "Gatwick"),
        airport("Paris", "France", "Charles de Gaulle Airport", "CDG", 49.0097, 2.5479, "Roissy"),
        airport("Amsterdam", "Netherlands", "Amsterdam Schiphol Airport", "AMS", 52.3105, 4.7683, "Schiphol"),
        airport("Frankfurt", "Germany", "Frankfurt Airport", "FRA", 50.0379, 8.5622),
        airport("Munich", "Germany", "Munich Airport", "MUC", 48.3538, 11.7861),
        airport("Zurich", "Switzerland", "Zurich Airport", "ZRH", 47.4581, 8.5555),
        airport("Istanbul", "Turkey", "Istanbul Airport", "IST", 41.2753, 28.7519),
        airport("Rome", "Italy", "Leonardo da Vinci Fiumicino Airport", "FCO", 41.8003, 12.2389, "Fiumicino"),
        airport("Madrid", "Spain", "Adolfo Suarez Madrid-Barajas Airport", "MAD", 40.4983, -3.5676, "Barajas"),
        airport("Barcelona", "Spain", "Josep Tarradellas Barcelona-El Prat Airport", "BCN", 41.2974, 2.0833, "El Prat"),
        airport("Vienna", "Austria", "Vienna International Airport", "VIE", 48.1103, 16.5697),
        airport("Brussels", "Belgium", "Brussels Airport", "BRU", 50.9014, 4.4844),
        airport("Copenhagen", "Denmark", "Copenhagen Airport", "CPH", 55.6180, 12.6560),
        airport("Oslo", "Norway", "Oslo Airport Gardermoen", "OSL", 60.1939, 11.1004, "Gardermoen"),
        airport("Stockholm", "Sweden", "Stockholm Arlanda Airport", "ARN", 59.6519, 17.9186, "Arlanda"),
        airport("Helsinki", "Finland", "Helsinki Airport", "HEL", 60.3172, 24.9633),

        airport("New York", "United States", "John F. Kennedy International Airport", "JFK", 40.6413, -73.7781, "Kennedy", "NYC"),
        airport("Newark", "United States", "Newark Liberty International Airport", "EWR", 40.6895, -74.1745, "New York Newark"),
        airport("Los Angeles", "United States", "Los Angeles International Airport", "LAX", 33.9416, -118.4085, "LA"),
        airport("Chicago", "United States", "O'Hare International Airport", "ORD", 41.9742, -87.9073, "Chicago O Hare", "O Hare"),
        airport("Dallas", "United States", "Dallas Fort Worth International Airport", "DFW", 32.8998, -97.0403, "Fort Worth"),
        airport("Washington", "United States", "Washington Dulles International Airport", "IAD", 38.9531, -77.4565, "Dulles"),
        airport("Boston", "United States", "Boston Logan International Airport", "BOS", 42.3656, -71.0096, "Logan"),
        airport("Toronto", "Canada", "Toronto Pearson International Airport", "YYZ", 43.6777, -79.6248, "Pearson"),
        airport("Vancouver", "Canada", "Vancouver International Airport", "YVR", 49.1967, -123.1815),
        airport("Montreal", "Canada", "Montreal Trudeau International Airport", "YUL", 45.4706, -73.7408, "Trudeau"),
        airport("Miami", "United States", "Miami International Airport", "MIA", 25.7959, -80.2870),
        airport("Houston", "United States", "George Bush Intercontinental Airport", "IAH", 29.9902, -95.3368, "Bush Intercontinental"),
        airport("San Francisco", "United States", "San Francisco International Airport", "SFO", 37.6213, -122.3790),

        airport("Cairo", "Egypt", "Cairo International Airport", "CAI", 30.1120, 31.4000),
        airport("Addis Ababa", "Ethiopia", "Addis Ababa Bole International Airport", "ADD", 8.9779, 38.7993, "Bole"),
        airport("Nairobi", "Kenya", "Jomo Kenyatta International Airport", "NBO", -1.3192, 36.9278),
        airport("Johannesburg", "South Africa", "O. R. Tambo International Airport", "JNB", -26.1337, 28.2420, "OR Tambo"),
        airport("Cape Town", "South Africa", "Cape Town International Airport", "CPT", -33.9715, 18.6021),
        airport("Lagos", "Nigeria", "Murtala Muhammed International Airport", "LOS", 6.5774, 3.3212),
        airport("Casablanca", "Morocco", "Mohammed V International Airport", "CMN", 33.3675, -7.5900),

        airport("Sydney", "Australia", "Sydney Kingsford Smith Airport", "SYD", -33.9399, 151.1753),
        airport("Melbourne", "Australia", "Melbourne Airport", "MEL", -37.6690, 144.8410, "Tullamarine"),
        airport("Perth", "Australia", "Perth Airport", "PER", -31.9403, 115.9672),
        airport("Auckland", "New Zealand", "Auckland Airport", "AKL", -37.0082, 174.7850)
    );

    public Optional<AirportCoordinate> resolve(String value) {
        String query = normalize(value);
        if (query.isBlank()) return Optional.empty();

        Optional<AirportCoordinate> exactIata = airports.stream()
            .filter(airport -> query.equals(airport.iataCode()))
            .findFirst();
        if (exactIata.isPresent()) return exactIata;

        Optional<AirportCoordinate> tokenIata = airports.stream()
            .filter(airport -> containsToken(query, airport.iataCode()))
            .findFirst();
        if (tokenIata.isPresent()) return tokenIata;

        Optional<AirportCoordinate> exactName = airports.stream()
            .filter(airport -> airport.searchTerms().stream().anyMatch(term -> query.equals(term)))
            .findFirst();
        if (exactName.isPresent()) return exactName;

        return airports.stream()
            .filter(airport -> airport.searchTerms().stream().anyMatch(term -> query.contains(term) || term.contains(query)))
            .findFirst();
    }

    public int airportCount() {
        return airports.size();
    }

    private static AirportCoordinate airport(String city, String country, String airportName, String iataCode,
                                             Double latitude, Double longitude, String... aliases) {
        List<String> searchTerms = Arrays.stream(aliases == null ? new String[0] : aliases)
            .map(AirportCoordinateService::normalize)
            .filter(term -> !term.isBlank())
            .toList();
        return new AirportCoordinate(city, country, airportName, iataCode, latitude, longitude, searchTerms);
    }

    private static boolean containsToken(String query, String token) {
        return Arrays.asList(query.split(" ")).contains(token);
    }

    private static String normalize(String value) {
        return value == null ? "" : value
            .toUpperCase(Locale.ROOT)
            .replaceAll("[^A-Z0-9]+", " ")
            .trim()
            .replaceAll("\\s+", " ");
    }

    public record AirportCoordinate(
        String city,
        String country,
        String airportName,
        String iataCode,
        Double latitude,
        Double longitude,
        List<String> aliases
    ) {
        private List<String> searchTerms() {
            List<String> coreTerms = List.of(
                AirportCoordinateService.normalize(city),
                AirportCoordinateService.normalize(country),
                AirportCoordinateService.normalize(airportName),
                AirportCoordinateService.normalize(iataCode)
            );
            return java.util.stream.Stream.concat(coreTerms.stream(), aliases.stream())
                .filter(term -> !term.isBlank())
                .toList();
        }
    }
}
