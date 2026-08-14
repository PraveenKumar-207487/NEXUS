package com.praveen.nexus.ai.service;

import com.praveen.nexus.ai.dto.ChatRequest;

public interface AiService {

    String generateResponse(ChatRequest request);
}