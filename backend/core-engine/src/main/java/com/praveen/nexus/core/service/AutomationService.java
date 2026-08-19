package com.praveen.nexus.core.service;
import java.util.List;

import com.praveen.nexus.core.dto.AutomationRequest;
import com.praveen.nexus.core.dto.AutomationResponse;

public interface AutomationService {

    AutomationResponse createAutomation(
            AutomationRequest request,
            String userId
    );

    List<AutomationResponse> getMyAutomations(
            String userId
    );

    AutomationResponse getAutomation(
            String automationId,
            String userId
    );

    AutomationResponse updateAutomation(
            String automationId,
            AutomationRequest request,
            String userId
    );

    void deleteAutomation(
            String automationId,
            String userId
    );

    AutomationResponse toggleAutomation(
            String automationId,
            String userId
    );
}
