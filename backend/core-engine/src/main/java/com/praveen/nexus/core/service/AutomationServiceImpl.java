package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.praveen.nexus.core.dto.AutomationRequest;
import com.praveen.nexus.core.dto.AutomationResponse;
import com.praveen.nexus.core.model.Automation;
import com.praveen.nexus.core.repository.AutomationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AutomationServiceImpl implements AutomationService {

    private final AutomationRepository automationRepository;

    @Override
    public AutomationResponse createAutomation(
            AutomationRequest request,
            String userId
    ) {

        Automation automation = new Automation();

        automation.setUserId(userId);
        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setAction(request.getAction());
        automation.setSchedule(request.getSchedule());
        automation.setType(request.getType());
        automation.setEnabled(request.isEnabled());

        automation.setCreatedAt(LocalDateTime.now());
        automation.setUpdatedAt(LocalDateTime.now());

        Automation saved = automationRepository.save(automation);

        return mapToResponse(saved);
    }

    @Override
    public List<AutomationResponse> getMyAutomations(
            String userId
    ) {

        return automationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AutomationResponse getAutomation(
            String automationId,
            String userId
    ) {

        Automation automation =
                automationRepository
                        .findByIdAndUserId(automationId, userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Automation not found"
                                )
                        );

        return mapToResponse(automation);
    }

    @Override
    public AutomationResponse updateAutomation(
            String automationId,
            AutomationRequest request,
            String userId
    ) {

        Automation automation =
                automationRepository
                        .findByIdAndUserId(automationId, userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Automation not found"
                                )
                        );

        /*
         * Step 16:
         * If the schedule changes, the new schedule must
         * start with a fresh execution state.
         */
        boolean scheduleChanged =
                !automation.getSchedule()
                        .equals(request.getSchedule());

        automation.setName(request.getName());
        automation.setDescription(request.getDescription());
        automation.setAction(request.getAction());
        automation.setSchedule(request.getSchedule());
        automation.setType(request.getType());
        automation.setEnabled(request.isEnabled());

        if (scheduleChanged) {
            automation.setLastExecutedAt(null);
        }

        automation.setUpdatedAt(LocalDateTime.now());

        Automation updated =
                automationRepository.save(automation);

        return mapToResponse(updated);
    }

    @Override
    public void deleteAutomation(
            String automationId,
            String userId
    ) {

        Automation automation =
                automationRepository
                        .findByIdAndUserId(automationId, userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Automation not found"
                                )
                        );

        automationRepository.delete(automation);
    }

    @Override
    public AutomationResponse toggleAutomation(
            String automationId,
            String userId
    ) {

        Automation automation =
                automationRepository
                        .findByIdAndUserId(automationId, userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Automation not found"
                                )
                        );

        automation.setEnabled(!automation.isEnabled());
        automation.setUpdatedAt(LocalDateTime.now());

        Automation updated =
                automationRepository.save(automation);

        return mapToResponse(updated);
    }

    private AutomationResponse mapToResponse(
            Automation automation
    ) {

        return new AutomationResponse(
                automation.getId(),
                automation.getUserId(),
                automation.getName(),
                automation.getDescription(),
                automation.getAction(),
                automation.getSchedule(),
                automation.getType(),
                automation.isEnabled(),
                automation.getCreatedAt(),
                automation.getUpdatedAt()
        );
    }
}