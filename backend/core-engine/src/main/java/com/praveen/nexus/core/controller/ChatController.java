package com.praveen.nexus.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ApiResponse;
import com.praveen.nexus.core.dto.ChatRequest;
import com.praveen.nexus.core.dto.ChatResponse;
import com.praveen.nexus.core.exception.ResourceNotFoundException;
import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.repository.UserRepository;
import com.praveen.nexus.core.service.ChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        ChatResponse response =
                chatService.chat(
                        user.getId(),
                        request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Chat response generated successfully",
                        response
                )
        );
    }
}