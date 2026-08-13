package com.praveen.nexus.core.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.praveen.nexus.core.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

   @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    System.out.println("=================================");
    System.out.println("REQUEST: "
            + request.getMethod()
            + " "
            + request.getRequestURI());

    System.out.println("AUTH HEADER: " + authHeader);

    // No Authorization header
    if (authHeader == null || authHeader.isBlank()) {

        System.out.println("NO JWT FOUND");

        filterChain.doFilter(request, response);
        return;
    }

    // Authorization header must start with Bearer
    if (!authHeader.startsWith("Bearer ")) {

        System.out.println("INVALID AUTHORIZATION HEADER");

        filterChain.doFilter(request, response);
        return;
    }

    String token = authHeader.substring(7).trim();

    System.out.println("TOKEN FOUND");

    try {

        // Validate JWT
        if (jwtService.isTokenValid(token)) {

            System.out.println("JWT VALID");

            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            System.out.println("Authenticated User: " + email);
            System.out.println("Role: " + role);

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(authority)
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println("SECURITY CONTEXT SET");

        } else {

            System.out.println("JWT INVALID");
        }

    } catch (Exception e) {

        System.out.println("JWT AUTHENTICATION FAILED");
        System.out.println("Reason: " + e.getMessage());

        SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
}
}