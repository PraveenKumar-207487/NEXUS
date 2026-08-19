package com.praveen.nexus.core.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AutomationRequest {

    @NotBlank(message = "Automation name is required")
    private String name;

    private String description;

    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "Schedule is required")
    private String schedule;

    @NotBlank(message = "Automation type is required")
    private String type;

    private boolean enabled = true;
}
