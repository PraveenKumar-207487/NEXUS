package com.praveen.nexus.core.service;

import java.util.List;

import com.praveen.nexus.core.model.Message;

public interface MessageService {

    Message createMessage(
            String conversationId,
            String userId,
            String role,
            String content);

    List<Message> getConversationMessages(
            String conversationId,
            String userId);

    void deleteMessage(
            String conversationId,
            String messageId,
            String userId);
}