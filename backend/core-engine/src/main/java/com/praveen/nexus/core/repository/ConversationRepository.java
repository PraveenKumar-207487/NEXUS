package com.praveen.nexus.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.praveen.nexus.core.model.Conversation;

public interface ConversationRepository
        extends MongoRepository<Conversation, String> {

    List<Conversation> findByUserId(String userId);

    Optional<Conversation> findByIdAndUserId(
            String id,
            String userId);
}