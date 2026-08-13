package com.praveen.nexus.core.service;

import java.util.List;

import com.praveen.nexus.core.model.Conversation;

public interface ConversationService {

    Conversation createConversation(String userId, String title);

    List<Conversation> getUserConversations(String userId);

    Conversation getConversationById(String id, String userId);

    Conversation updateConversation(String id, String userId, String title);

    void deleteConversation(String id, String userId);
}