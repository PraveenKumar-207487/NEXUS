package com.praveen.nexus.core.util;

import java.time.LocalDateTime;

import com.praveen.nexus.core.dto.ApiResponse;

public class ResponseUtil {

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(
                true,
                message,
                data,
                LocalDateTime.now()
        );
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(
                false,
                message,
                null,
                LocalDateTime.now()
        );
    }
}