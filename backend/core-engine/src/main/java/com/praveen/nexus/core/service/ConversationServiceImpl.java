package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.repository.ConversationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;

    @Override
    public Conversation createConversation(String userId, String title) {

        Conversation conversation = new Conversation();

        conversation.setUserId(userId);
        conversation.setTitle(title);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        return conversationRepository.save(conversation);
    }

    @Override
    public List<Conversation> getUserConversations(String userId) {

        return conversationRepository.findByUserId(userId);
    }

    @Override
    public Conversation getConversationById(
            String conversationId,
            String userId) {

        // First find the conversation
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Conversation not found"));

        // Check ownership
        if (!conversation.getUserId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this conversation");
        }

        return conversation;
    }

    @Override
    public void deleteConversation(
            String conversationId,
            String userId) {

        // First find the conversation
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Conversation not found"));

        // Check ownership
        if (!conversation.getUserId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this conversation");
        }

        conversationRepository.delete(conversation);
    }
}