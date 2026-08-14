package com.praveen.nexus.ai.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    private String message;

    private List<ConversationMessage> conversationHistory;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationMessage {

        private String role;

        private String content;
    }
}