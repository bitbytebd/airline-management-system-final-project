package com.cogent.config;

//
// ╔══════════════════════════════════════════════════════════════╗
// ║  ROOT CAUSE OF FRONTEND DATA PROBLEM — EXPLAINED             ║
// ║                                                              ║
// ║  When Spring Security is added:                              ║
// ║  1. Security filter chain runs BEFORE MVC CORS filter        ║
// ║  2. Blocked requests never reach @CrossOrigin annotations    ║
// ║  3. Browser sees no CORS headers → blocks the response       ║
// ║  4. CSRF blocks all POST/PUT/DELETE requests                 ║
// ║                                                              ║
// ║  FIX: Configure CORS INSIDE SecurityFilterChain (not via    ║
// ║  CorsFilter bean). Disable CSRF for stateless REST API.     ║
// ║  IMPORTANT: DELETE the old CorsConfig.java file!            ║
// ╚══════════════════════════════════════════════════════════════╝

import com.cogent.security.JwtAuthFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origin:http://localhost:4200}")
    private String allowedOrigin;

    // ── Security Filter Chain ─────────────────────────────
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ❶ Disable CSRF — REST API is stateless, no session cookies
            .csrf(AbstractHttpConfigurer::disable)

            // ❷ CORS — MUST be configured here, not via CorsFilter bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ❸ Stateless sessions — JWT handles auth, no HttpSession needed
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ❹ Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public — Auth endpoints (login/register) always open
                .requestMatchers("/auth/**").permitAll()

                // ── CURRENT PHASE: permit all API calls ────────────────
                // During development, all endpoints are open.
                // When login module is ready, replace with role-based rules below.
                .anyRequest().permitAll()

                // ── PRODUCTION RULES (uncomment when login is ready) ───
                // .requestMatchers(HttpMethod.GET, "/**").hasAnyRole("SUPER_ADMIN","ADMIN","MANAGER","AGENT","VIEWER")
                // .requestMatchers("/users/**").hasAnyRole("SUPER_ADMIN","ADMIN")
                // .requestMatchers("/pricing/**").hasAnyRole("SUPER_ADMIN","ADMIN","MANAGER")
                // .requestMatchers(HttpMethod.DELETE, "/**").hasAnyRole("SUPER_ADMIN","ADMIN")
                // .anyRequest().authenticated()
            )

            // ❺ Add JWT filter before username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── CORS Configuration ────────────────────────────────
    // This bean is used by the .cors() config above
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow Angular dev server
        config.setAllowedOrigins(List.of(allowedOrigin));

        // Allow all HTTP methods including OPTIONS (preflight)
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));

        // Allow all headers including Authorization
        config.setAllowedHeaders(List.of("*"));

        // Expose Authorization header to Angular
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ── Password Encoder ──────────────────────────────────
    // ── Password Encoder ──────────────────────────────────
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }




    // ── Auth Manager ──────────────────────────────────────
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
