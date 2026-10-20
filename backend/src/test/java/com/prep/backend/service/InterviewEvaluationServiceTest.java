package com.prep.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.prep.backend.entity.Difficulty;

import static org.junit.jupiter.api.Assertions.*;

class InterviewEvaluationServiceTest {

    private InterviewEvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        evaluationService = new InterviewEvaluationService();
    }

    @Test
    void testNormalizeEvaluation() {
        assertEquals("CORRECT", evaluationService.normalizeEvaluation("CORRECT"));
        assertEquals("CORRECT", evaluationService.normalizeEvaluation("correct"));
        assertEquals("PARTIALLY_CORRECT", evaluationService.normalizeEvaluation("PARTIALLY_CORRECT"));
        assertEquals("PARTIALLY_CORRECT", evaluationService.normalizeEvaluation("partially correct"));
        assertEquals("INCORRECT", evaluationService.normalizeEvaluation("INCORRECT"));
        assertEquals("INCORRECT", evaluationService.normalizeEvaluation("wrong"));
        assertEquals("INCORRECT", evaluationService.normalizeEvaluation(null));
    }

    @Test
    void testIsIDontKnowAnswer() {
        assertTrue(evaluationService.isIDontKnowAnswer("I don't know"));
        assertTrue(evaluationService.isIDontKnowAnswer("i do not know"));
        assertTrue(evaluationService.isIDontKnowAnswer("not sure"));
        assertTrue(evaluationService.isIDontKnowAnswer("no idea"));
        assertTrue(evaluationService.isIDontKnowAnswer(null));
        assertTrue(evaluationService.isIDontKnowAnswer(""));
        assertFalse(evaluationService.isIDontKnowAnswer("In Java, polymorphism allows methods to do different things."));
    }

    @Test
    void testIsNoCandidateQuestionAnswer() {
        assertTrue(evaluationService.isNoCandidateQuestionAnswer("No"));
        assertTrue(evaluationService.isNoCandidateQuestionAnswer("No thank you"));
        assertTrue(evaluationService.isNoCandidateQuestionAnswer("I have no questions"));
        assertTrue(evaluationService.isNoCandidateQuestionAnswer(null));
        assertFalse(evaluationService.isNoCandidateQuestionAnswer("What is the typical tech stack for this role?"));
    }

    @Test
    void testBuildIDontKnowFeedback() {
        String feedback = evaluationService.buildIDontKnowFeedback("Dependency injection is an inversion of control pattern");
        assertTrue(feedback.startsWith("It is okay. The correct answer is"));
        assertFalse(feedback.contains("No, your answer is incorrect"));
    }

    @Test
    void testDifficultyInstructions() {
        String easy = evaluationService.getDifficultyInstructions(Difficulty.EASY);
        assertTrue(easy.contains("EASY"));
        assertTrue(easy.contains("fundamentals"));

        String medium = evaluationService.getDifficultyInstructions(Difficulty.MEDIUM);
        assertTrue(medium.contains("MEDIUM"));
        assertTrue(medium.contains("practical scenarios"));

        String hard = evaluationService.getDifficultyInstructions(Difficulty.HARD);
        assertTrue(hard.contains("HARD"));
        assertTrue(hard.contains("deeper concepts"));
    }

    @Test
    void testIsConversationalRemark() {
        // Insults & hostility
        assertTrue(evaluationService.isConversationalRemark("Are you stupid?"));
        assertTrue(evaluationService.isConversationalRemark("you are dumb"));
        assertTrue(evaluationService.isConversationalRemark("what an idiot"));

        // Clarifications & repetitions
        assertTrue(evaluationService.isConversationalRemark("Can you repeat the question?"));
        assertTrue(evaluationService.isConversationalRemark("Could you please repeat that?"));
        assertTrue(evaluationService.isConversationalRemark("What did you say?"));
        assertTrue(evaluationService.isConversationalRemark("pardon me"));

        // Audio & mic checks
        assertTrue(evaluationService.isConversationalRemark("Can you hear me?"));
        assertTrue(evaluationService.isConversationalRemark("mic check 1 2 3"));
        assertTrue(evaluationService.isConversationalRemark("testing 1 2 3"));

        // Legitimate answers must NOT be flagged
        assertFalse(evaluationService.isConversationalRemark("Hi Maya, I am a full-stack engineer with experience in React and Spring Boot."));
        assertFalse(evaluationService.isConversationalRemark("In my last project, I built a microservices platform handling order processing."));
        assertFalse(evaluationService.isConversationalRemark("The time complexity of quicksort in the average case is O(n log n)."));
        assertFalse(evaluationService.isConversationalRemark("I don't know"));
    }

    @Test
    void testBuildConversationalRemarkResponse() {
        String currentQ = "Tell me about yourself.";
        var response = evaluationService.buildConversationalRemarkResponse(currentQ, "Are you stupid?");

        assertTrue(response.isConversationalRemark());
        assertEquals("UNRELATED", response.getEvaluation());
        assertEquals(currentQ, response.getNextQuestion());
        assertTrue(response.getFeedback().contains("professional"));

        var repeatResponse = evaluationService.buildConversationalRemarkResponse(currentQ, "Can you repeat the question?");
        assertTrue(repeatResponse.isConversationalRemark());
        assertTrue(repeatResponse.getFeedback().contains(currentQ));
    }
}
