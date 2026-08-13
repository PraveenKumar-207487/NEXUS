package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.repository.UserRepository;
import com.praveen.nexus.core.service.ConversationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Conversation> createConversation(
            @RequestParam String title,
            Authentication authentication) {

        String email = authentication.getName();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        Conversation conversation =
                conversationService.createConversation(
                        userId,
                        title
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(conversation);
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(
            Authentication authentication) {

        String email = authentication.getName();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        return ResponseEntity.ok(
                conversationService.getUserConversations(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        return ResponseEntity.ok(
                conversationService.getConversationById(
                        id,
                        userId
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conversation> updateConversation(
            @PathVariable String id,
            @RequestParam String title,
            Authentication authentication) {

        String email = authentication.getName();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        return ResponseEntity.ok(
                conversationService.updateConversation(
                        id,
                        userId,
                        title
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        conversationService.deleteConversation(
                id,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}