package com.smartlibrary.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        
                http
        .cors(cors -> {})
        .csrf(csrf ->
                csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/auth/**",
                                "/actuator/health"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/books/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/semantic-search").hasAnyRole("STUDENT", "LIBRARIAN")
                         
                        
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/reservations"
                        ).hasAnyRole(
                                "STUDENT",
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reservations/**"
                        ).hasAnyRole(
                                "STUDENT",
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/reservations/fulfill-next/**"
                        ).hasRole(
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/demand/dashboard"
                        ).hasRole(
                                "LIBRARIAN"
                        )
                        .requestMatchers(HttpMethod.GET, "/api/acquisition/**").hasRole("LIBRARIAN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/books",
                                "/api/books/*/copies"
                        ).hasRole(
                                "LIBRARIAN"
                        )
                        .requestMatchers(
        HttpMethod.GET,
        "/api/notifications"
).hasAnyRole("STUDENT", "LIBRARIAN")
                        .requestMatchers(
    HttpMethod.POST,
    "/api/book-management/books",
    "/api/book-management/books/*/copies"
).hasRole("LIBRARIAN")

.requestMatchers(
    HttpMethod.PUT,
    "/api/book-management/books/*"
).hasRole("LIBRARIAN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users",
                                "/api/users/**"
                        ).hasRole(
                                "LIBRARIAN"
                        )

                        .requestMatchers(HttpMethod.POST, "/api/reminders")
    .hasRole("LIBRARIAN")

.requestMatchers(HttpMethod.GET, "/api/reminders/my")
    .hasAnyRole("STUDENT", "LIBRARIAN")

.requestMatchers(HttpMethod.PUT, "/api/reminders/*/read")
    .hasAnyRole("STUDENT", "LIBRARIAN")
                        .requestMatchers(
        HttpMethod.GET,
        "/api/chat/my"
).hasAnyRole("STUDENT", "LIBRARIAN")
                
      .requestMatchers("/api/ai/**")
    .hasAnyRole("STUDENT", "LIBRARIAN")

.requestMatchers(
        HttpMethod.POST,
        "/api/chat"
).hasAnyRole("STUDENT", "LIBRARIAN")

.requestMatchers(
        HttpMethod.GET,
        "/api/chat/students"
).hasRole("LIBRARIAN")

.requestMatchers(
        HttpMethod.GET,
        "/api/chat/all"
).hasRole("LIBRARIAN")

.requestMatchers(
        HttpMethod.PUT,
        "/api/chat/*/read"
).hasAnyRole("STUDENT", "LIBRARIAN")
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/circulation/issue"
                        ).hasRole(
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/circulation/borrow"
                        ).hasRole(
                                "STUDENT"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/circulation/return/student/**"
                        ).hasRole(
                                "STUDENT"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/circulation/return/**"
                        ).hasRole(
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/circulation"
                        ).hasRole(
                                "LIBRARIAN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/circulation/user/**"
                        ).hasAnyRole(
                                "STUDENT",
                                "LIBRARIAN"
                        )

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}