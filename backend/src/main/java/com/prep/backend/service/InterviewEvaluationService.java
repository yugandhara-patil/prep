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
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return normalised.equals("i dont know") || normalised.equals("i do not know")
                || normalised.equals("dont know") || normalised.equals("do not know")
                || normalised.equals("not sure") || normalised.equals("i am not sure")
                || normalised.equals("no idea") || normalised.equals("i have no idea");
    }

    public boolean isNoCandidateQuestionAnswer(String answer) {
        if (answer == null || answer.isBlank()) return true;
        String normalised = answer.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();

        if (normalised.isBlank()) {
            return true;
        }

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

    public boolean isConversationalRemark(String answer, String currentQuestion, String stage) {
        if (answer == null || answer.isBlank()) return false;
        String normalised = answer.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();

        if (normalised.isBlank()) return false;

        // Never mark genuine "I don't know" answers as conversational remarks
        if (isIDontKnowAnswer(answer)) return false;

        // Allow start permission and candidate questions stages to run their standard flow
        if ("START_PERMISSION".equals(stage) || "CANDIDATE_QUESTIONS".equals(stage)) {
            if (isNoCandidateQuestionAnswer(answer)) return false;
        }

        // 1. Inappropriate, rude, or offensive remarks / insults
        String[] rudeKeywords = {
                "are you stupid", "are you dumb", "you are stupid", "you are dumb", "youre stupid", "youre dumb",
                "stupid bot", "dumb bot", "are you an idiot", "you are an idiot", "you idiot", "idiot",
                "shut up", "shut your mouth", "get lost", "fuck off", "bullshit", "nonsense",
                "you suck", "this sucks", "waste of time", "useless bot", "you are useless", "are you crazy"
        };
        for (String rk : rudeKeywords) {
            if (normalised.contains(rk)) {
                return true;
            }
        }

        // 2. Clarification / repetition requests
        String[] clarificationPhrases = {
                "can you repeat", "could you repeat", "please repeat", "repeat the question", "repeat that",
                "say that again", "what did you say", "what was the question", "can you say that again",
                "could you say that again", "can you clarify", "could you clarify", "what do you mean",
                "what do you mean by that", "can you rephrase", "could you rephrase", "rephrase the question",
                "i didnt hear you", "i did not hear you", "i didnt understand the question", "i did not understand the question",
                "i dont understand what you mean", "i do not understand what you mean", "can you speak louder",
                "pardon me", "pardon", "excuse me"
        };
        for (String cp : clarificationPhrases) {
            if (normalised.equals(cp) || normalised.startsWith(cp + " ") || normalised.endsWith(" " + cp)) {
                return true;
            }
        }

        // 3. Confusion / non-answers
        String[] confusionPhrases = {
                "wait what", "what do you mean", "pardon", "pardon me", "excuse me",
                "what are you asking", "what question is that"
        };
        for (String cp : confusionPhrases) {
            if (normalised.equals(cp) || normalised.startsWith(cp + " ")) {
                return true;
            }
        }

        // 4. Mic check / mid-interview greetings
        String[] micChecks = {
                "can you hear me", "can you hear me now", "are you listening", "are you there",
                "hello are you there", "am i audible", "mic check", "testing mic", "test 1 2 3",
                "testing 1 2 3", "testing 123", "is anyone there", "hello is anyone there"
        };
        for (String mc : micChecks) {
            if (normalised.equals(mc) || normalised.startsWith(mc + " ") || normalised.contains(mc)) {
                return true;
            }
        }

        // 5. Off-topic questions / jokes directed at the interviewer
        String[] offTopic = {
                "who are you", "who made you", "what is your name", "tell me a joke",
                "what is the weather", "what time is it", "how old are you", "are you a human",
                "are you a robot", "are you an ai", "are you real", "what is your favorite movie"
        };
        for (String ot : offTopic) {
            if (normalised.equals(ot) || normalised.startsWith(ot + " ")) {
                return true;
            }
        }

        return false;
    }

    public boolean isConversationalRemark(String answer) {
        return isConversationalRemark(answer, "", "");
    }

    public com.prep.backend.dto.AnswerResponse buildConversationalRemarkResponse(String currentQuestion, String answer) {
        return buildConversationalRemarkResponse(answer, currentQuestion, "", null);
    }

    public com.prep.backend.dto.AnswerResponse buildConversationalRemarkResponse(
            String answer,
            String currentQuestion,
            String stage,
            com.prep.backend.entity.User user
    ) {
        com.prep.backend.dto.AnswerResponse response = new com.prep.backend.dto.AnswerResponse();
        response.setConversationalRemark(true);
        response.setEvaluation("UNRELATED");
        response.setNextStage(stage);
        response.setNextQuestion(currentQuestion);
        response.setCommunicationScore(null);
        response.setTechnicalKnowledgeScore(null);
        response.setProjectKnowledgeScore(null);
        response.setResponseQualityScore(null);

        String normalised = (answer != null ? answer.trim().toLowerCase() : "")
                .replace("'", "")
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();

        // 1. Rude or insulting remark (Matches the user's explicit example)
        if (normalised.contains("stupid") || normalised.contains("dumb") || normalised.contains("idiot")
                || normalised.contains("shut up") || normalised.contains("useless") || normalised.contains("sucks")) {
            response.setFeedback("I'm here to help you practise. Let's keep the conversation professional. Would you like to try answering again?");
            return response;
        }

        // 2. Clarification / repetition request
        if (normalised.contains("repeat") || normalised.contains("say that again") || normalised.contains("didnt hear")
                || normalised.contains("what was the question") || normalised.contains("speak louder")) {
            response.setFeedback("Certainly! Let me repeat the question for you: " + currentQuestion);
            return response;
        }

        // 3. Clarification / rephrase / what do you mean
        if (normalised.contains("clarify") || normalised.contains("what do you mean") || normalised.contains("rephrase")
                || normalised.contains("didnt understand") || normalised.contains("dont understand")) {
            response.setFeedback("No problem. To clarify: " + currentQuestion);
            return response;
        }

        // 4. Mic check / audibility
        if (normalised.contains("hear me") || normalised.contains("audible") || normalised.contains("mic check")
                || normalised.contains("are you there")) {
            response.setFeedback("Yes, I can hear you clearly! Whenever you're ready, please answer: " + currentQuestion);
            return response;
        }

        // 5. Off-topic joke / remark
        if (normalised.contains("joke") || normalised.contains("weather") || normalised.contains("who made you")
                || normalised.contains("who are you") || normalised.contains("how old are you")) {
            response.setFeedback("Let's keep our focus on your interview preparation. Whenever you're ready, please answer: " + currentQuestion);
            return response;
        }

        // Generic polite redirection
        response.setFeedback("Let's stay focused on your interview. Would you like to try answering: " + currentQuestion);
        return response;
    }
}
