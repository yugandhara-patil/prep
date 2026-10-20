package com.prep.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.prep.backend.entity.InterviewType;

import static org.junit.jupiter.api.Assertions.*;

class InterviewFlowServiceTest {

    private InterviewFlowService flowService;

    @BeforeEach
    void setUp() {
        flowService = new InterviewFlowService();
    }

    @Test
    void testTechnicalInterviewStrictSequence() {
        String stage = "GREETING";

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("WELLBEING", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("START_PERMISSION", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("INTRODUCTION", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("PROJECT_1", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("PROJECT_2", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("PROJECT_3", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_1", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_2", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_3", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_4", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_5", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("TECHNICAL_6", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("CANDIDATE_QUESTIONS", stage);

        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("CLOSING", stage);

        // Terminal state
        stage = flowService.determineNextStage(InterviewType.TECHNICAL, stage);
        assertEquals("CLOSING", stage);
    }

    @Test
    void testHrInterviewProgression() {
        String stage = "GREETING";

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("WELLBEING", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("START_PERMISSION", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("INTRODUCTION", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("BACKGROUND", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("STRENGTHS", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("WEAKNESS", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("ROLE_MOTIVATION", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("WHY_HIRE", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("TEAMWORK", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("CHALLENGES", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("CAREER_GOALS", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("EXPECTATIONS", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("CANDIDATE_QUESTIONS", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("CLOSING", stage);

        stage = flowService.determineNextStage(InterviewType.HR, stage);
        assertEquals("CLOSING", stage);
    }

    @Test
    void testIsReadyToStart() {
        assertTrue(flowService.isReadyToStart("Yes"));
        assertTrue(flowService.isReadyToStart("I am ready"));
        assertTrue(flowService.isReadyToStart("Sure"));
        assertTrue(flowService.isReadyToStart("Let's start"));
        assertFalse(flowService.isReadyToStart("No, not yet"));
        assertFalse(flowService.isReadyToStart(null));
    }

    @Test
    void testCandidateQuestionsIntentDetection() {
        // Positive intent to ask
        assertTrue(flowService.isCandidateAskingToAsk("Yes"));
        assertTrue(flowService.isCandidateAskingToAsk("Sure"));
        assertTrue(flowService.isCandidateAskingToAsk("I have a question"));
        assertTrue(flowService.isCandidateAskingToAsk("Can I ask a question?"));
        assertFalse(flowService.isCandidateAskingToAsk("What is the tech stack?"));
        assertFalse(flowService.isCandidateAskingToAsk("No thank you"));

        // No questions / Finished intent
        assertTrue(flowService.isNoCandidateQuestionAnswer("No"));
        assertTrue(flowService.isNoCandidateQuestionAnswer("No thank you"));
        assertTrue(flowService.isNoCandidateQuestionAnswer("I don't have any questions"));
        assertTrue(flowService.isNoCandidateQuestionAnswer("That's all, thanks"));
        assertTrue(flowService.isNoCandidateQuestionAnswer("Nothing else"));
        assertTrue(flowService.isNoCandidateQuestionAnswer("I am good, thank you"));
        assertFalse(flowService.isNoCandidateQuestionAnswer("Can you describe the team culture?"));
        assertFalse(flowService.isNoCandidateQuestionAnswer("What are the next steps?"));
        assertFalse(flowService.isNoCandidateQuestionAnswer("Yes"));

        // Unclear response
        assertTrue(flowService.isUnclearCandidateResponse(null));
        assertTrue(flowService.isUnclearCandidateResponse(""));
        assertTrue(flowService.isUnclearCandidateResponse("?"));
        assertFalse(flowService.isUnclearCandidateResponse("What is the role?"));

        // Stage transitions:
        // Asking an actual question remains in CANDIDATE_QUESTIONS
        assertEquals("CANDIDATE_QUESTIONS",
                flowService.determineCandidateQuestionsStage("What does the tech stack look like?", java.util.Collections.emptyList()));

        // Saying Yes remains in CANDIDATE_QUESTIONS to prompt for the question
        assertEquals("CANDIDATE_QUESTIONS",
                flowService.determineCandidateQuestionsStage("Yes, I have a question", java.util.Collections.emptyList()));

        // Unclear response remains in CANDIDATE_QUESTIONS to ask for repeat
        assertEquals("CANDIDATE_QUESTIONS",
                flowService.determineCandidateQuestionsStage("", java.util.Collections.emptyList()));

        // Finished response moves to CLOSING
        assertEquals("CLOSING",
                flowService.determineCandidateQuestionsStage("No thank you, that's all", java.util.Collections.emptyList()));
    }
}
