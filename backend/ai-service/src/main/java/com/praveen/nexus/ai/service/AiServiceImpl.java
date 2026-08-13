package com.praveen.nexus.ai.service;

import org.springframework.stereotype.Service;

@Service
public class AiServiceImpl implements AiService {

    @Override
    public String generateResponse(String message) {

        return "NEXUS AI received: " + message;
    }
}