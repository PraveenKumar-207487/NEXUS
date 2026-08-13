package com.praveen.nexus.core.service;

import org.springframework.stereotype.Service;

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

    private final AiClient aiClient;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Override
    public ChatResponse chat(String userId, ChatRequest request) {

        // 1. Create a new conversation
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .title(request.getMessage())
                .build();

        conversation = conversationRepository.save(conversation);

        // 2. Save user's message
        Message userMessage = Message.builder()
                .conversationId(conversation.getId())
                .userId(userId)
                .role("USER")
                .content(request.getMessage())
                .build();

        messageRepository.save(userMessage);

        // 3. Send message to AI service
        String aiResponse = aiClient.getAiResponse(
                request.getMessage()
        );

        // 4. Save AI response
        Message aiMessage = Message.builder()
                .conversationId(conversation.getId())
                .userId(userId)
                .role("AI")
                .content(aiResponse)
                .build();

        messageRepository.save(aiMessage);

        // 5. Return response
        return new ChatResponse(
                conversation.getId(),
                request.getMessage(),
                aiResponse
        );
    }
}