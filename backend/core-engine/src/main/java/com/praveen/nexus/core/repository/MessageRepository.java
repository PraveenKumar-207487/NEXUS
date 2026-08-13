package com.praveen.nexus.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.praveen.nexus.core.model.Message;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    Optional<Message> findByIdAndUserId(String id, String userId);

}