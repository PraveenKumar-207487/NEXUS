package com.praveen.nexus.core.dto;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutomationResponse {

    private String id;

    private String userId;

    private String name;

    private String description;

    private String action;

    private String schedule;

    private String type;

    private boolean enabled;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
