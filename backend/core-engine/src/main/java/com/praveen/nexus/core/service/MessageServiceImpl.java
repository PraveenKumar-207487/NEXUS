package com.praveen.nexus.core.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.praveen.nexus.core.model.Message;
import com.praveen.nexus.core.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    public Message createMessage(
            String conversationId,
            String userId,
            String role,
            String content) {

        Message message = Message.builder()
                .conversationId(conversationId)
                .userId(userId)
                .role(role)
                .content(content)
                .build();

        return messageRepository.save(message);
    }

    @Override
    public List<Message> getConversationMessages(String conversationId) {

        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Override
    public void deleteMessage(String id) {

        if (!messageRepository.existsById(id)) {
            throw new RuntimeException("Message not found");
        }

        messageRepository.deleteById(id);
    }
}