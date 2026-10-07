package com.smartlibrary.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

   @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

    String authHeader =
            request.getHeader("Authorization");

    System.out.println(
            "AUTH HEADER: " + authHeader +
            " | REQUEST: " +
            request.getRequestURI()
    );

    if (authHeader == null
            || !authHeader.startsWith("Bearer ")) {

        filterChain.doFilter(
                request,
                response
        );

        return;
    }

    String token =
            authHeader.substring(7);

    try {

        boolean valid =
                jwtService.isTokenValid(token);

        System.out.println(
                "JWT VALID: " + valid +
                " | REQUEST: " +
                request.getRequestURI()
        );

        if (valid) {

            Claims claims =
                    jwtService.extractClaims(token);

            String email =
                    claims.getSubject();

            String role =
                    claims.get(
                            "role",
                            String.class
                    );

            System.out.println(
                    "JWT USER: " + email +
                    " | JWT ROLE: " + role +
                    " | REQUEST: " +
                    request.getRequestURI()
            );

            if (email != null
                    && role != null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" +
                                                role.toUpperCase()
                                        )
                                )
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );

                System.out.println(
                        "AUTHENTICATION SET: " +
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                );
            }
        }

    } catch (Exception e) {

        System.out.println(
                "JWT ERROR: " +
                e.getClass().getName() +
                " | " +
                e.getMessage()
        );

        SecurityContextHolder
                .clearContext();
    }

    // VERY IMPORTANT:
    // Continue the request to Spring Security
    // and finally to the Controller.
    filterChain.doFilter(
            request,
            response
    );
}
}