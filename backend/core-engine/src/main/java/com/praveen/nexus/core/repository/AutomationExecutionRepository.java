package com.praveen.nexus.core.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.praveen.nexus.core.model.AutomationExecution;

public interface AutomationExecutionRepository
        extends MongoRepository<AutomationExecution, String> {

    List<AutomationExecution> findByAutomationIdAndUserIdOrderByExecutedAtDesc(
            String automationId,
            String userId
    );

    List<AutomationExecution> findByUserIdOrderByExecutedAtDesc(
            String userId
    );
}