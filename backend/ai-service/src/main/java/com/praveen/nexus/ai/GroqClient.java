package com.praveen.nexus.ai;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GroqClient {

    private final RestClient restClient;
    private final String model;

    public GroqClient(
            @Value("${groq.base-url}") String baseUrl,
            @Value("${groq.api-key}") String apiKey,
            @Value("${groq.model}") String model) {

        this.model = model;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String generateResponse(List<GroqMessage> messages) {

        GroqRequest request = new GroqRequest(model, messages);

        GroqResponse response = restClient
                .post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(GroqResponse.class);

        if (response == null
                || response.choices() == null
                || response.choices().isEmpty()
                || response.choices().get(0).message() == null) {

            throw new RuntimeException("Groq returned an empty response");
        }

        return response.choices().get(0).message().content();
    }

    public record GroqRequest(
            String model,
            List<GroqMessage> messages
    ) {
    }

    public record GroqMessage(
            String role,
            String content
    ) {
    }

    public record GroqResponse(
            List<Choice> choices
    ) {
    }

    public record Choice(
            GroqMessage message
    ) {
    }
}