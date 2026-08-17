package com.praveen.nexus.core.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String message;
    private String name;
    private String email;
    private String role;
    private String assistantName;
    private String token;
}