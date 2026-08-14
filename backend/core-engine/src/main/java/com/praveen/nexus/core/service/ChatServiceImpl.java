package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.nexus.core.dto.ChatRequest;
import com.praveen.nexus.core.dto.ChatResponse;
import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.model.Message;
import com.praveen.nexus.core.repository.ConversationRepository;
import com.praveen.nexus.core.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final AiClient aiClient;

    @Override
    public ChatResponse chat(
            String userId,
            ChatRequest request) {

        String conversationId = request.getConversationId();

        // 1. Find conversation
        Conversation conversation =
                conversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Conversation not found"));

        // 2. Verify conversation ownership
        if (!conversation.getUserId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this conversation");
        }

        // 3. Load existing conversation history for context and preserve it in a
        // separate list before saving the current user message. This avoids
        // accidental duplication or mutation while the current message is saved.
        List<Message> conversationHistory =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Message> preservedHistory =
                conversationHistory == null
                        ? new ArrayList<>()
                        : new ArrayList<>(conversationHistory);

        // 4. Save USER message
        Message userMessage = new Message();

        userMessage.setConversationId(conversationId);
        userMessage.setUserId(userId);
        userMessage.setRole("USER");
        userMessage.setContent(request.getMessage());
        userMessage.setCreatedAt(LocalDateTime.now());

        messageRepository.save(userMessage);

        // 5. Send message to AI service using the preserved history snapshot.
        String aiResponse;
        try {
            aiResponse = aiClient.getAiResponse(
                    request.getMessage(),
                    preservedHistory);
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "AI service is currently unavailable. Please try again later.");
        }

        // 6. Save ASSISTANT message
        Message assistantMessage = new Message();

        assistantMessage.setConversationId(conversationId);

        // AI message does not belong to the user
        assistantMessage.setUserId(null);

        assistantMessage.setRole("ASSISTANT");
        assistantMessage.setContent(aiResponse);
        assistantMessage.setCreatedAt(LocalDateTime.now());

        messageRepository.save(assistantMessage);

        // 7. Return response
        return new ChatResponse(
                conversationId,
                request.getMessage(),
                aiResponse
        );
    }
}