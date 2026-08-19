package com.praveen.nexus.core.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.praveen.nexus.core.model.Automation;

public interface AutomationRepository extends MongoRepository<Automation, String> {

    List<Automation> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Automation> findByIdAndUserId(String id, String userId);
}
