package com.praveen.nexus.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ChatRequest;
import com.praveen.nexus.core.dto.ChatResponse;
import com.praveen.nexus.core.service.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        String userId = authentication.getName();

        ChatResponse response =
                chatService.chat(userId, request);

        return ResponseEntity.ok(response);
    }
}