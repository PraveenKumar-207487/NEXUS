package com.praveen.nexus.core.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private String id;
    private String name;
    private String assistantName;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(
            String id,
            String name,
            String assistantName,
            String email,
            String role,
            LocalDateTime createdAt) {

        this.id = id;
        this.name = name;
        this.assistantName = assistantName;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAssistantName() {
        return assistantName;
    }

    public void setAssistantName(String assistantName) {
        this.assistantName = assistantName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}