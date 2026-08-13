package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ConversationRequest;
import com.praveen.nexus.core.model.Conversation;
import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.repository.UserRepository;
import com.praveen.nexus.core.service.ConversationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private UserRepository userRepository;

    // CREATE CONVERSATION
    @PostMapping
    public ResponseEntity<Conversation> createConversation(
            @Valid @RequestBody ConversationRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Conversation conversation =
                conversationService.createConversation(
                        user.getId(),
                        request.getTitle());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(conversation);
    }

    // GET USER'S CONVERSATIONS
    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Conversation> conversations =
                conversationService.getUserConversations(
                        user.getId());

        return ResponseEntity.ok(conversations);
    }

    // GET CONVERSATION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversationById(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Conversation conversation =
                conversationService.getConversationById(
                        id,
                        user.getId());

        return ResponseEntity.ok(conversation);
    }

    // DELETE CONVERSATION
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable String id,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        conversationService.deleteConversation(
                id,
                user.getId());

        return ResponseEntity.noContent().build();
    }
}