package com.praveen.nexus.core.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.praveen.nexus.core.dto.ChatRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AiClient {

    private final RestClient restClient;

    public String getAiResponse(String message) {

        ChatRequest request = new ChatRequest(message);

        return restClient
                .post()
                .uri("http://localhost:8081/ai/chat")
                .body(request)
                .retrieve()
                .body(String.class);
    }
}