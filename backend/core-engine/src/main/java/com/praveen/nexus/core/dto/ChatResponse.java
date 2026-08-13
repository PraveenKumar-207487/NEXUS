package com.praveen.nexus.core.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private String conversationId;
    private String userMessage;
    private String aiResponse;
}