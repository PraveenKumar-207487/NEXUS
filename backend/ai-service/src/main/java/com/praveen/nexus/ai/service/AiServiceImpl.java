package com.praveen.nexus.ai.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.praveen.nexus.ai.GroqClient;
import com.praveen.nexus.ai.dto.ChatRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final GroqClient groqClient;

    @Override
    public String generateResponse(ChatRequest request) {

        List<GroqClient.GroqMessage> messages = new ArrayList<>();

        String assistantName = request.getAssistantName();
        if (assistantName == null || assistantName.isBlank()) {
            assistantName = "Jarvis";
        }

        // System instruction
        messages.add(
                new GroqClient.GroqMessage(
                        "system",
                        "You are " + assistantName + ", the user's personal AI assistant. " +
                        "Answer clearly and naturally. Use the conversation history " +
                        "to maintain context."
                )
        );

        // Existing conversation history
        if (request.getConversationHistory() != null) {

            for (ChatRequest.ConversationMessage historyMessage
                    : request.getConversationHistory()) {

                String role = convertRole(historyMessage.getRole());

                messages.add(
                        new GroqClient.GroqMessage(
                                role,
                                historyMessage.getContent()
                        )
                );
            }
        }

        // Current user message
        messages.add(
                new GroqClient.GroqMessage(
                        "user",
                        request.getMessage()
                )
        );

        return groqClient.generateResponse(messages);
    }

    private String convertRole(String role) {

        if (role == null) {
            return "user";
        }

        if ("USER".equalsIgnoreCase(role)) {
            return "user";
        }

        if ("AI".equalsIgnoreCase(role)
                || "ASSISTANT".equalsIgnoreCase(role)) {
            return "assistant";
        }

        return "user";
    }
}