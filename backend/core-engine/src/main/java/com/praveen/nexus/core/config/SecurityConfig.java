package com.praveen.nexus.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");

                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Authentication required\",\"data\":null}"
                    );
                })
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public registration
                .requestMatchers(
                    HttpMethod.POST,
                    "/users",
                    "/users/register"
                ).permitAll()

                // Public login
                .requestMatchers(
                    HttpMethod.POST,
                    "/users/login"
                ).permitAll()

                // Admin-only user listing
                .requestMatchers(
                    HttpMethod.GET,
                    "/users"
                ).hasRole("ADMIN")

                // Admin-only database information
                .requestMatchers(
                    HttpMethod.GET,
                    "/users/dbinfo"
                ).hasRole("ADMIN")

                // USER can view own profile, ADMIN can view any user
                .requestMatchers(
                    HttpMethod.GET,
                    "/users/{id}"
                ).hasAnyRole("USER", "ADMIN")

                // Only ADMIN can update
                .requestMatchers(
                    HttpMethod.PUT,
                    "/users/**"
                ).hasRole("ADMIN")

                // Only ADMIN can delete
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/users/**"
                ).hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}