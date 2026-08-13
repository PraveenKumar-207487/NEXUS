package com.praveen.nexus.core.dto;

import jakarta.validation.constraints.NotBlank;

public class ConversationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    public ConversationRequest() {
    }

    public ConversationRequest(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}