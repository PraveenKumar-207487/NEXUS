package com.praveen.nexus.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.ai.dto.ChatRequest;
import com.praveen.nexus.ai.dto.ChatResponse;
import com.praveen.nexus.ai.service.AiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request) {

        String response =
                aiService.generateResponse(request);

        return ResponseEntity.ok(
                new ChatResponse(response)
        );
    }
}