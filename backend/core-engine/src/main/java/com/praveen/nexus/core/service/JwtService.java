package com.praveen.nexus.core.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60; // 1 hour

    private final String jwtSecret;

    public JwtService(@Value("${jwt.secret}") String jwtSecret) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT secret is missing. Set the JWT_SECRET environment variable and configure jwt.secret=${JWT_SECRET}.");
        }

        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must be at least 32 bytes (256 bits) for HS256 signing.");
        }

        this.jwtSecret = jwtSecret;
    }

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email, String role) {

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis()
                                + EXPIRATION_TIME)
                )
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean isTokenValid(String token) {

        try {

            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    public String extractRole(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }
}
