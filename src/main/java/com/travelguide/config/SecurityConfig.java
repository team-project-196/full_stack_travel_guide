package com.travelguide.config;

import com.travelguide.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                org.springframework.security.config.http.SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // 🔓 Allow frontend pages
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/register.html",
                                "/destinations.html",
                                "/trip-planner.html",
                                "/bookmarks.html",
                                "/bookings.html"
                        ).permitAll()

                        // 🔓 Allow static resources
                        .requestMatchers(
                                "/css/**",
                                "/js/**",
                                "/images/**"
                        ).permitAll()

                        // 🔓 Auth APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // 🔓 Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // 🔓 Public destinations
                        .requestMatchers(HttpMethod.GET, "/api/destinations/**").permitAll()

                        // 🔒 Admin destination management
                        .requestMatchers(HttpMethod.POST, "/api/destinations").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/destinations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/destinations/**").hasRole("ADMIN")

                        // 🔒 Admin bookings
                        .requestMatchers("/api/bookings/admin/**").hasRole("ADMIN")

                        // 🔒 User bookings
                        .requestMatchers("/api/bookings/my").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").authenticated()

                        // 🔒 Bookmarks
                        .requestMatchers("/api/bookmarks/**").authenticated()

                        // 🔒 Everything else requires login
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}