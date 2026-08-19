package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.model.AutomationExecution;
import com.praveen.nexus.core.service.AutomationExecutionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/automation-executions")
public class AutomationExecutionController {

    private final AutomationExecutionService executionService;

    @GetMapping
    public List<AutomationExecution> getUserExecutionHistory(
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return executionService.getUserExecutionHistory(userId);
    }

    @GetMapping("/automation/{automationId}")
    public List<AutomationExecution> getAutomationHistory(
            @PathVariable String automationId,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return executionService.getAutomationHistory(
                automationId,
                userId
        );
    }
}