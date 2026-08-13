package com.praveen.nexus.core.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.repository.ConversationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;

    @Override
    public Conversation createConversation(String userId, String title) {

        Conversation conversation = Conversation.builder()
                .userId(userId)
                .title(title)
                .build();

        return conversationRepository.save(conversation);
    }

    @Override
    public List<Conversation> getUserConversations(String userId) {

        return conversationRepository.findByUserId(userId);
    }

    @Override
    public Conversation getConversationById(
            String id,
            String userId) {

        return conversationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Conversation not found"));
    }

    @Override
    public Conversation updateConversation(
            String id,
            String userId,
            String title) {

        Conversation conversation =
                conversationRepository
                        .findByIdAndUserId(id, userId)
                        .orElseThrow(() ->
                                new RuntimeException("Conversation not found"));

        conversation.setTitle(title);

        return conversationRepository.save(conversation);
    }

    @Override
    public void deleteConversation(
            String id,
            String userId) {

        Conversation conversation =
                conversationRepository
                        .findByIdAndUserId(id, userId)
                        .orElseThrow(() ->
                                new RuntimeException("Conversation not found"));

        conversationRepository.delete(conversation);
    }
}