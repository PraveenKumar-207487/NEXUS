package com.praveen.nexus.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.model.Message;
import com.praveen.nexus.core.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/conversations/{conversationId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<Message> createMessage(
            @PathVariable String conversationId,
            @RequestParam String userId,
            @RequestParam String role,
            @RequestParam String content) {

        Message message = messageService.createMessage(
                conversationId,
                userId,
                role,
                content
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }

    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String conversationId) {

        return ResponseEntity.ok(
                messageService.getConversationMessages(conversationId)
        );
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String messageId) {

        messageService.deleteMessage(messageId);

        return ResponseEntity.noContent().build();
    }
}