package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.model.Message;
import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.repository.UserRepository;
import com.praveen.nexus.core.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Message> createMessage(
            @PathVariable String conversationId,
            @RequestParam String role,
            @RequestParam String content,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Message message = messageService.createMessage(
                conversationId,
                user.getId(),
                role,
                content
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }

    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String conversationId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return ResponseEntity.ok(
                messageService.getConversationMessages(
                        conversationId,
                        user.getId())
        );
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String conversationId,
            @PathVariable String messageId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        messageService.deleteMessage(
                conversationId,
                messageId,
                user.getId());

        return ResponseEntity.noContent().build();
    }
}