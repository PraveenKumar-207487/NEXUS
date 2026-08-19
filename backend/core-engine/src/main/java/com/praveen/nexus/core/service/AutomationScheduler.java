package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import com.praveen.nexus.core.model.Automation;
import com.praveen.nexus.core.repository.AutomationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationScheduler {

    private final AutomationRepository automationRepository;
    private final AutomationExecutionService executionService;

    @Scheduled(cron = "0 * * * * *")
    public void processAutomations() {

        LocalDateTime now = LocalDateTime.now();

        log.info(
                "Automation scheduler checking at {}",
                now
        );

        List<Automation> automations =
                automationRepository.findAll();

        for (Automation automation : automations) {

            if (!automation.isEnabled()) {
                continue;
            }

            try {

                CronExpression cron =
                        CronExpression.parse(
                                automation.getSchedule()
                        );

                LocalDateTime currentMinute =
                        now.withSecond(0).withNano(0);

                LocalDateTime previousMinute =
                        currentMinute.minusMinutes(1);

                LocalDateTime nextExecution =
                        cron.next(previousMinute);

                if (nextExecution != null
                        && nextExecution.equals(currentMinute)) {

                    /*
                     * Step 13:
                     * Prevent the same automation from executing
                     * more than once for the same scheduled time.
                     */
                    if (automation.getLastExecutedAt() != null
                            && automation.getLastExecutedAt()
                                    .equals(currentMinute)) {

                        log.info(
                                "Skipping duplicate execution for automation: {} at {}",
                                automation.getName(),
                                currentMinute
                        );

                        continue;
                    }

                    /*
                     * Mark this scheduled occurrence as executed
                     * before running the automation.
                     */
                    automation.setLastExecutedAt(currentMinute);

                    automationRepository.save(automation);

                    executeAutomation(automation);
                }

            } catch (Exception e) {

                log.error(
                        "Failed to process automation: {}",
                        automation.getName(),
                        e
                );

                executionService.recordFailure(
                        automation,
                        e.getMessage()
                );
            }
        }
    }

    private void executeAutomation(
            Automation automation
    ) {

        log.info(
                "Executing automation: {}",
                automation.getName()
        );

        switch (automation.getType().toUpperCase()) {

            case "REMINDER":

                executeReminder(automation);

                break;

            default:

                log.warn(
                        "Unsupported automation type: {}",
                        automation.getType()
                );

                executionService.recordFailure(
                        automation,
                        "Unsupported automation type: "
                                + automation.getType()
                );
        }
    }

    private void executeReminder(
            Automation automation
    ) {

        String result =
                "Reminder triggered: "
                        + automation.getAction();

        log.info(result);

        executionService.recordSuccess(
                automation,
                result
        );
    }
}