package com.praveen.nexus.core.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    @NotBlank(message = "Conversation ID cannot be empty")
    private String conversationId;

    @NotBlank(message = "Message cannot be empty")
    private String message;
}