package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.model.Message;
import com.praveen.nexus.core.repository.ConversationRepository;
import com.praveen.nexus.core.repository.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    @Override
    public Message createMessage(
            String conversationId,
            String userId,
            String role,
            String content) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation not found"));

        if (!conversation.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this conversation");
        }

        Message message = new Message();

        message.setConversationId(conversationId);
        message.setUserId(userId);
        message.setRole(role);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    @Override
    public List<Message> getConversationMessages(
            String conversationId,
            String userId) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation not found"));

        if (!conversation.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this conversation");
        }

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Override
    public void deleteMessage(
            String conversationId,
            String messageId,
            String userId) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Conversation not found"));

        if (!conversation.getUserId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete messages from this conversation");
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Message not found"));

        if (!message.getConversationId().equals(conversationId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This message does not belong to this conversation");
        }

        boolean ownsMessage = message.getUserId() != null && message.getUserId().equals(userId);
        boolean ownsConversation = conversation.getUserId().equals(userId);

        if (!ownsMessage && !ownsConversation) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this message");
        }

        messageRepository.delete(message);
    }
}