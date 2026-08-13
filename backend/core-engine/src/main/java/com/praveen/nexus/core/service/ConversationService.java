package com.praveen.nexus.core.service;

import java.util.List;

import com.praveen.nexus.core.model.Conversation;

public interface ConversationService {

    Conversation createConversation(String userId, String title);

    List<Conversation> getUserConversations(String userId);

    Conversation getConversationById(String conversationId, String userId);

    void deleteConversation(String conversationId, String userId);
}