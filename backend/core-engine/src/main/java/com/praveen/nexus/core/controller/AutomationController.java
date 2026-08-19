package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.AutomationRequest;
import com.praveen.nexus.core.dto.AutomationResponse;
import com.praveen.nexus.core.service.AutomationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/automations")
@RequiredArgsConstructor
public class AutomationController {

    private final AutomationService automationService;

    @PostMapping
    public ResponseEntity<AutomationResponse> createAutomation(
            @Valid @RequestBody AutomationRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        AutomationResponse response =
                automationService.createAutomation(
                        request,
                        userId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<AutomationResponse>> getMyAutomations(
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                automationService.getMyAutomations(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomationResponse> getAutomation(
            @PathVariable String id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                automationService.getAutomation(
                        id,
                        userId
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomationResponse> updateAutomation(
            @PathVariable String id,
            @Valid @RequestBody AutomationRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                automationService.updateAutomation(
                        id,
                        request,
                        userId
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAutomation(
            @PathVariable String id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        automationService.deleteAutomation(
                id,
                userId
        );

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<AutomationResponse> toggleAutomation(
            @PathVariable String id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                automationService.toggleAutomation(
                        id,
                        userId
                )
        );
    }
}
