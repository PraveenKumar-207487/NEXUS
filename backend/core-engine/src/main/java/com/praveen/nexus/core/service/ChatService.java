package com.praveen.nexus.core.service;

import com.praveen.nexus.core.dto.ChatRequest;
import com.praveen.nexus.core.dto.ChatResponse;

public interface ChatService {

    ChatResponse chat(String userId, ChatRequest request);
}