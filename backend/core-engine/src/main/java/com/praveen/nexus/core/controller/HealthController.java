package com.praveen.nexus.core.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ApiResponse;
import com.praveen.nexus.core.service.HealthService;

@RestController
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> health() {
        return healthService.getHealthStatus();
    }
}