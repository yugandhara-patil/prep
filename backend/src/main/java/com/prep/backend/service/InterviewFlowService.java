package com.prep.backend.service;

import org.springframework.stereotype.Service;

import com.prep.backend.entity.InterviewType;

@Service
public class InterviewFlowService {

    /**
     * Determines the next stage in the interview.
     *
     * Technical interview sequence:
     * GREETING
     * -> WELLBEING
     * -> START_PERMISSION
     * -> INTRODUCTION
     * -> PROJECT_1
     * -> PROJECT_2
     * -> PROJECT_3
     * -> TECHNICAL_1
     * -> TECHNICAL_2
     * -> TECHNICAL_3
     * -> TECHNICAL_4
     * -> TECHNICAL_5
     * -> TECHNICAL_6
     * -> CANDIDATE_QUESTIONS
     * -> CLOSING
     */
    public String determineNextStage(
            InterviewType interviewType,
            String currentStage
    ) {
        if (interviewType == InterviewType.HR) {
            return determineNextHrStage(currentStage);
        }

        return determineNextTechnicalStage(currentStage);
    }

    private String determineNextTechnicalStage(String currentStage) {
        if (currentStage == null) {
            return "WELLBEING";
        }

        return switch (currentStage) {
            case "GREETING" -> "WELLBEING";
            case "WELLBEING" -> "START_PERMISSION";
            case "START_PERMISSION" -> "INTRODUCTION";
            case "INTRODUCTION" -> "PROJECT_1";
            case "PROJECT_1" -> "PROJECT_2";
            case "PROJECT_2" -> "PROJECT_3";
            case "PROJECT_3" -> "TECHNICAL_1";
            case "TECHNICAL_1" -> "TECHNICAL_2";
            case "TECHNICAL_2" -> "TECHNICAL_3";
            case "TECHNICAL_3" -> "TECHNICAL_4";
            case "TECHNICAL_4" -> "TECHNICAL_5";
            case "TECHNICAL_5" -> "TECHNICAL_6";
            case "TECHNICAL_6" -> "CANDIDATE_QUESTIONS";
            case "CANDIDATE_QUESTIONS" -> "CLOSING";
            case "CLOSING" -> "CLOSING";
            default -> "WELLBEING";
        };
    }

    private String determineNextHrStage(String currentStage) {
        if (currentStage == null) {
            return "WELLBEING";
        }

        return switch (currentStage) {
            case "GREETING" -> "WELLBEING";
            case "WELLBEING" -> "INTRODUCTION";
            case "INTRODUCTION" -> "BACKGROUND";
            case "BACKGROUND" -> "HR_BEHAVIOURAL";
            case "HR_BEHAVIOURAL" -> "HR_BEHAVIOURAL";
            case "CANDIDATE_QUESTIONS" -> "CLOSING";
            case "CLOSING" -> "CLOSING";
            default -> "HR_BEHAVIOURAL";
        };
    }

    public boolean isTechnicalStage(String stage) {
        if (stage == null) {
            return false;
        }

        return stage.startsWith("TECHNICAL_");
    }

    public boolean isProjectStage(String stage) {
        if (stage == null) {
            return false;
        }

        return switch (stage) {
            case "PROJECT_1", "PROJECT_2", "PROJECT_3" -> true;
            default -> false;
        };
    }

    public boolean isFixedQuestionStage(String stage) {
        if (stage == null) {
            return false;
        }

        return switch (stage) {
            case "WELLBEING",
                 "START_PERMISSION",
                 "INTRODUCTION",
                 "CANDIDATE_QUESTIONS",
                 "CLOSING" -> true;
            default -> false;
        };
    }

    public String getFixedQuestion(
            String stage,
            String candidateName
    ) {
        if (stage == null) {
            return null;
        }

        return switch (stage) {
            case "WELLBEING" ->
                    "How are you doing today?";

            case "START_PERMISSION" ->
                    "Great. Shall we begin?";

            case "INTRODUCTION" ->
                    "So, " + candidateName
                            + ", could you please introduce yourself?";

            case "CANDIDATE_QUESTIONS" ->
                    "Do you have any questions for me?";

            case "CLOSING" ->
                    "Thank you for your time. It was great speaking with you.";

            default -> null;
        };
    }
}
