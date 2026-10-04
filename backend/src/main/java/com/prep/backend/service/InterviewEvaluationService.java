package com.prep.backend.service;

import org.springframework.stereotype.Service;

import com.prep.backend.entity.Difficulty;

@Service
public class InterviewEvaluationService {

    public String normalizeEvaluation(String evaluation) {
        if (evaluation == null) return "INCORRECT";
        String value = evaluation.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if (value.contains("PARTIALLY")) return "PARTIALLY_CORRECT";
        if (value.contains("INCORRECT") || value.contains("WRONG")) return "INCORRECT";
        if (value.contains("CORRECT")) return "CORRECT";
        return "INCORRECT";
    }

    public String buildFeedback(String evaluation, String generatedFeedback, String correctAnswer) {
        String type = normalizeEvaluation(evaluation);
        if ("CORRECT".equals(type)) return "";
        String feedback = generatedFeedback == null ? "" : generatedFeedback.trim();
        if ("PARTIALLY_CORRECT".equals(type)) {
            if (!feedback.toLowerCase().startsWith("your answer is partially correct")) {
                feedback = "Your answer is partially correct." + (feedback.isEmpty() ? "" : " " + feedback);
            }
        } else if (!feedback.toLowerCase().startsWith("your answer is incorrect")
                && !feedback.toLowerCase().startsWith("no, your answer is incorrect")) {
            feedback = "Your answer is incorrect." + (feedback.isEmpty() ? "" : " " + feedback);
        }
        return limitFeedback(feedback);
    }

    public String buildIDontKnowFeedback(String correctAnswer) {
        String answer = correctAnswer == null ? "" : correctAnswer.trim();
        if (answer.isEmpty()) return "It is okay. The correct answer is not available.";
        return limitFeedback("It is okay. The correct answer is " + answer + ".");
    }

    public String getDifficultyInstructions(Difficulty difficulty) {
        if (difficulty == null) return """
                Use moderate interview depth.
                Ask practical questions appropriate for the candidate's resume and target role.
                """;
        return switch (difficulty) {
            case EASY -> """
                    Difficulty: EASY.
                    Test fundamentals and basic understanding.
                    Prefer clear definition, purpose, and simple application questions.
                    """;
            case MEDIUM -> """
                    Difficulty: MEDIUM.
                    Test application, comparisons, practical scenarios, moderate debugging, and reasoning.
                    """;
            case HARD -> """
                    Difficulty: HARD.
                    Test deeper concepts, edge cases, trade-offs, architecture, advanced debugging, and detailed reasoning.
                    """;
        };
    }

    public boolean isIDontKnowAnswer(String answer) {
        if (answer == null || answer.isBlank()) return true;
        String normalised = answer.trim().toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return normalised.equals("i dont know") || normalised.equals("i do not know")
                || normalised.equals("dont know") || normalised.equals("do not know")
                || normalised.equals("not sure") || normalised.equals("i am not sure")
                || normalised.equals("no idea") || normalised.equals("i have no idea");
    }

    public boolean isNoCandidateQuestionAnswer(String answer) {
        if (answer == null || answer.isBlank()) return true;
        String normalised = answer.trim().toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return normalised.equals("no") || normalised.equals("no thanks")
                || normalised.equals("no thank you") || normalised.equals("nothing")
                || normalised.equals("nothing else") || normalised.equals("i have no questions")
                || normalised.equals("i dont have any questions")
                || normalised.equals("i do not have any questions");
    }

    private String limitFeedback(String feedback) {
        if (feedback == null) return "";
        feedback = feedback.trim();
        if (feedback.length() <= 180) return feedback;
        feedback = feedback.substring(0, 180).trim();
        int lastSpace = feedback.lastIndexOf(' ');
        if (lastSpace > 80) feedback = feedback.substring(0, lastSpace);
        if (!feedback.endsWith(".")) feedback += ".";
        return feedback;
    }
}
