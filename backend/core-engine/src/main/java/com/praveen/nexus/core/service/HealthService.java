package com.praveen.nexus.core.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.praveen.nexus.core.dto.ApiResponse;
import com.praveen.nexus.core.util.ResponseUtil;

@Service
public class HealthService {

    public ApiResponse<Map<String, String>> getHealthStatus() {

        Map<String, String> data = Map.of(
                "status", "UP"
        );

        return ResponseUtil.success(
                "Core Engine is running",
                data
        );
    }
}