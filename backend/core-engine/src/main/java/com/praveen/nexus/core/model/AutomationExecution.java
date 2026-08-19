package com.praveen.nexus.core.model;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "automation_executions")
public class AutomationExecution {

    @Id
    private String id;

    private String automationId;

    private String userId;

    private String automationName;

    private String action;

    private String status;

    private String result;

    private LocalDateTime executedAt;
}
