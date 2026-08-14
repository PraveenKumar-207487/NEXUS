package com.praveen.nexus.core.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.praveen.nexus.core.model.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Component
public class AiClient {

    private final RestClient restClient;

    public AiClient(
            RestClient.Builder restClientBuilder,
            @Value("${ai.service.url:http://localhost:8081}") String aiServiceUrl) {

        this.restClient = restClientBuilder
                .baseUrl(aiServiceUrl)
                .build();
    }

    public String getAiResponse(
            String message,
            List<Message> conversationHistory) {

        // Build conversation history for AI Service
        List<ConversationMessage> history = new ArrayList<>();

        if (conversationHistory != null) {

            for (Message msg : conversationHistory) {

                history.add(new ConversationMessage(msg.getRole(), msg.getContent()));
            }
        }

        AiRequest request = new AiRequest(message, history);

        AiResponse response = restClient
                .post()
                .uri("/ai/chat")
                .body(request)
                .retrieve()
                .body(AiResponse.class);

        if (response == null || response.getResponse() == null) {
            throw new RuntimeException("AI service returned an empty response");
        }

        return response.getResponse();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class AiRequest {

        private String message;

        private List<ConversationMessage> conversationHistory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class ConversationMessage {

        private String role;

        private String content;
    }

    @Data
    private static class AiResponse {

        private String response;
    }
}