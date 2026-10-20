package com.prep.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.prep.backend.entity.InterviewAnswer;
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
            case "WELLBEING" -> "START_PERMISSION";
            case "START_PERMISSION" -> "INTRODUCTION";
            case "INTRODUCTION" -> "BACKGROUND";
            case "BACKGROUND" -> "STRENGTHS";
            case "STRENGTHS" -> "WEAKNESS";
            case "WEAKNESS" -> "ROLE_MOTIVATION";
            case "ROLE_MOTIVATION" -> "WHY_HIRE";
            case "WHY_HIRE" -> "TEAMWORK";
            case "TEAMWORK" -> "CHALLENGES";
            case "CHALLENGES" -> "CAREER_GOALS";
            case "CAREER_GOALS" -> "EXPECTATIONS";
            case "EXPECTATIONS" -> "CANDIDATE_QUESTIONS";
            case "HR_BEHAVIOURAL" -> "CANDIDATE_QUESTIONS";
            case "CANDIDATE_QUESTIONS" -> "CLOSING";
            case "CLOSING" -> "CLOSING";
            default -> "CANDIDATE_QUESTIONS";
        };
    }

    /**
     * Checks whether the candidate is ready to begin the interview.
     */
    public boolean isReadyToStart(String answer) {
        if (answer == null) {
            return false;
        }

        String normalized = answer
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z\\s']", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return normalized.equals("yes")
                || normalized.equals("yeah")
                || normalized.equals("yep")
                || normalized.equals("sure")
                || normalized.equals("okay")
                || normalized.equals("ok")
                || normalized.equals("alright")
                || normalized.equals("ready")
                || normalized.equals("i'm ready")
                || normalized.equals("im ready")
                || normalized.equals("i am ready")
                || normalized.equals("lets begin")
                || normalized.equals("let's begin")
                || normalized.equals("lets start")
                || normalized.equals("let's start");
    }

    /**
     * Checks whether the candidate is not ready to begin yet.
     */
    public boolean isNotReadyToStart(String answer) {
        if (answer == null) {
            return false;
        }

        String normalized = answer
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z\\s']", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return normalized.equals("no")
                || normalized.equals("nope")
                || normalized.equals("not yet")
                || normalized.equals("not now")
                || normalized.equals("wait")
                || normalized.equals("give me a minute")
                || normalized.equals("give me a moment")
                || normalized.equals("one minute")
                || normalized.equals("one moment")
                || normalized.equals("hold on");
    }

    /**
     * Returns the next stage based on the candidate's response
     * to "Great. Shall we begin?"
     *
     * YES / READY -> INTRODUCTION
     * NO / NOT READY -> remain at START_PERMISSION
     */
    public String determineStartPermissionStage(String answer) {
        if (isNotReadyToStart(answer)) {
            return "START_PERMISSION";
        }

        if (isReadyToStart(answer)) {
            return "INTRODUCTION";
        }

        // If the response is unclear, keep Maya at the
        // start-permission stage rather than accidentally
        // starting the interview.
        return "START_PERMISSION";
    }

    /**
     * Checks if the candidate speech response is unclear or too short.
     */
    public boolean isUnclearCandidateResponse(String answer) {
        if (answer == null) {
            return true;
        }
        String trimmed = answer.trim();
        return trimmed.length() < 2;
    }

    /**
     * Checks if the candidate explicitly expresses a desire to ask a question
     * (e.g., "Yes", "Sure", "I have a question") without stating the actual question yet.
     */
    public boolean isCandidateAskingToAsk(String answer) {
        if (answer == null || answer.isBlank()) {
            return false;
        }
        String normalised = answer.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return normalised.equals("yes")
                || normalised.equals("yeah")
                || normalised.equals("yep")
                || normalised.equals("sure")
                || normalised.equals("yes i do")
                || normalised.equals("i do")
                || normalised.equals("i have a question")
                || normalised.equals("i have one question")
                || normalised.equals("i have some questions")
                || normalised.equals("i have a few questions")
                || normalised.equals("yes i have a question")
                || normalised.equals("yes i have one question")
                || normalised.equals("can i ask a question")
                || normalised.equals("could i ask a question")
                || normalised.equals("may i ask a question")
                || normalised.equals("i would like to ask a question");
    }

    /**
     * Checks if the candidate explicitly indicates they have no questions / are finished.
     */
    public boolean isNoCandidateQuestionAnswer(String answer) {
        if (answer == null || answer.isBlank()) {
            return false;
        }
        String normalised = answer.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();

        if (normalised.isBlank()) {
            return false;
        }

        // Direct phrase checks
        if (normalised.equals("no") || normalised.equals("nope") || normalised.equals("nah")
                || normalised.equals("nothing") || normalised.equals("none")) {
            return true;
        }

        String[] finishPhrases = {
                "no", "nope", "nah", "nothing", "none",
                "no thanks", "no thank you",
                "nothing else", "nothing for now", "nothing from my side", "nothing from my end",
                "no questions", "no more questions", "no further questions",
                "i have no questions", "i dont have any questions", "i do not have any questions",
                "i have no more questions", "i dont have any more questions", "i do not have any more questions",
                "thats all", "that is all", "thats it", "that is it",
                "all good", "all set", "all clear", "everything is clear",
                "i am good", "im good", "im all good", "i am all good",
                "i think im good", "i think i am good",
                "thats all for now", "that is all for now",
                "thats all thank you", "that is all thank you", "thats all thanks",
                "all good thank you", "all good thanks",
                "no questions thank you", "no questions thanks",
                "i am good thank you", "im good thank you",
                "i am good thanks", "im good thanks"
        };

        for (String phrase : finishPhrases) {
            if (normalised.equals(phrase)) {
                return true;
            }
        }

        // Compound finish phrases, e.g. "no thank you thats all", "no thats all", "no im good thank you"
        if (normalised.startsWith("no ") || normalised.startsWith("nope ") || normalised.startsWith("nah ") || normalised.startsWith("nothing ")) {
            String remainder = normalised.replaceFirst("^(no|nope|nah|nothing)\\s+", "").trim();
            for (String phrase : finishPhrases) {
                if (remainder.equals(phrase) || remainder.startsWith(phrase)) {
                    return true;
                }
            }
            if (remainder.equals("thank you") || remainder.equals("thanks") || remainder.equals("thank you so much")
                    || remainder.equals("thats all") || remainder.equals("that is all") || remainder.equals("thats it")
                    || remainder.equals("for now") || remainder.equals("from my side") || remainder.equals("from my end")) {
                return true;
            }
        }

        // If candidate ends with "thats all" / "that is all" / "thats it" / "no questions"
        if (normalised.endsWith("thats all") || normalised.endsWith("that is all")
                || normalised.endsWith("thats it") || normalised.endsWith("that is it")
                || normalised.endsWith("thats all thank you") || normalised.endsWith("thats all thanks")
                || normalised.endsWith("that is all thank you") || normalised.endsWith("that is all thanks")) {
            if (!normalised.startsWith("what") && !normalised.startsWith("why") && !normalised.startsWith("how")
                    && !normalised.startsWith("is") && !normalised.startsWith("can") && !normalised.startsWith("could")) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determines whether to stay in CANDIDATE_QUESTIONS or proceed to CLOSING.
     */
    public String determineCandidateQuestionsStage(
            String answer,
            List<InterviewAnswer> previousAnswers
    ) {
        if (isUnclearCandidateResponse(answer)) {
            return "CANDIDATE_QUESTIONS";
        }

        if (isCandidateAskingToAsk(answer)) {
            return "CANDIDATE_QUESTIONS";
        }

        if (isNoCandidateQuestionAnswer(answer)) {
            return "CLOSING";
        }

        long count = previousAnswers == null ? 0 :
                previousAnswers.stream()
                        .filter(a -> "CANDIDATE_QUESTIONS".equals(a.getStage()))
                        .count();

        if (count >= 5) {
            return "CLOSING";
        }

        return "CANDIDATE_QUESTIONS";
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