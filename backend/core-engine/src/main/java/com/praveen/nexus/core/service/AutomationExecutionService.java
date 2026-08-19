package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.praveen.nexus.core.model.Automation;
import com.praveen.nexus.core.model.AutomationExecution;
import com.praveen.nexus.core.repository.AutomationExecutionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AutomationExecutionService {

    private final AutomationExecutionRepository executionRepository;

    public AutomationExecution recordSuccess(
            Automation automation,
            String result
    ) {

        AutomationExecution execution = new AutomationExecution();

        execution.setAutomationId(automation.getId());
        execution.setUserId(automation.getUserId());
        execution.setAutomationName(automation.getName());
        execution.setAction(automation.getAction());
        execution.setStatus("SUCCESS");
        execution.setResult(result);
        execution.setExecutedAt(LocalDateTime.now());

        return executionRepository.save(execution);
    }

    public AutomationExecution recordFailure(
            Automation automation,
            String result
    ) {

        AutomationExecution execution = new AutomationExecution();

        execution.setAutomationId(automation.getId());
        execution.setUserId(automation.getUserId());
        execution.setAutomationName(automation.getName());
        execution.setAction(automation.getAction());
        execution.setStatus("FAILED");
        execution.setResult(result);
        execution.setExecutedAt(LocalDateTime.now());

        return executionRepository.save(execution);
    }

    public List<AutomationExecution> getAutomationHistory(
            String automationId,
            String userId
    ) {

        return executionRepository
                .findByAutomationIdAndUserIdOrderByExecutedAtDesc(
                        automationId,
                        userId
                );
    }

    public List<AutomationExecution> getUserExecutionHistory(
            String userId
    ) {

        return executionRepository
                .findByUserIdOrderByExecutedAtDesc(userId);
    }
}