package com.praveen.nexus.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.nexus.core.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Duplicate Email
    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<?> handleUserAlreadyExists(UserAlreadyExistsException ex) {

        return new ApiResponse<>(
                false,
                ex.getMessage(),
                null
        );
    }

    // Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return new ApiResponse<>(
                false,
                message,
                null
        );
    }

    // Invalid Login Credentials
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleBadCredentials(
            BadCredentialsException ex) {

        return new ApiResponse<>(
                false,
                "Invalid email or password",
                null
        );
    }

    // Authorization / resource exceptions
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<?>> handleResponseStatusException(
            ResponseStatusException ex) {

        return ResponseEntity.status(ex.getStatusCode())
                .body(new ApiResponse<>(
                        false,
                        ex.getReason(),
                        null
                ));
    }
    // Resource Not Found
@ExceptionHandler(ResourceNotFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public ApiResponse<?> handleResourceNotFound(
        ResourceNotFoundException ex) {

    return new ApiResponse<>(
            false,
            ex.getMessage(),
            null
    );
}

// Unexpected Errors
@ExceptionHandler(Exception.class)
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public ApiResponse<?> handleGeneralException(Exception ex) {

    return new ApiResponse<>(
            false,
            "Internal server error",
            null
    );
}
}