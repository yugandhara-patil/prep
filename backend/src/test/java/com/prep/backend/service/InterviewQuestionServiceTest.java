package com.prep.backend.service;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.prep.backend.dto.AnswerRequest;
import com.prep.backend.dto.AnswerResponse;
import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class InterviewQuestionServiceTest {

    private GeminiService geminiService;
    private InterviewAnswerRepository interviewAnswerRepository;
    private InterviewFlowService interviewFlowService;
    private InterviewEvaluationService interviewEvaluationService;
    private InterviewQuestionService questionService;

    private Interview interview;
    private User user;

    @BeforeEach
    void setUp() {
        geminiService = Mockito.mock(GeminiService.class);
        interviewAnswerRepository = Mockito.mock(InterviewAnswerRepository.class);
        interviewFlowService = new InterviewFlowService();
        interviewEvaluationService = new InterviewEvaluationService();

        questionService = new InterviewQuestionService(
                geminiService,
                interviewAnswerRepository,
                interviewFlowService,
                interviewEvaluationService
        );

        user = new User();
        user.setId(1L);
        user.setFullName("Yugandhara Patil");
        user.setEmail("yugandhara@example.com");

        interview = new Interview();
        interview.setId(126L);
        interview.setUser(user);
        interview.setInterviewType(InterviewType.HR);
        interview.setTargetRole("Full Stack Developer");
        interview.setDifficulty(Difficulty.MEDIUM);
        interview.setResumeText("Java, Spring Boot, React, Python");
    }

    @Test
    void testCandidateQuestionsWhenUserSaysYes() {
        AnswerRequest request = new AnswerRequest();
        request.setInterviewId(126L);
        request.setCurrentQuestion("Do you have any questions for me?");
        request.setUserAnswer("yes");

        String stage = "CANDIDATE_QUESTIONS";
        String nextStage = interviewFlowService.determineCandidateQuestionsStage("yes", Collections.emptyList());
        assertEquals("CANDIDATE_QUESTIONS", nextStage);

        AnswerResponse response = questionService.generateInterviewResponse(
                interview,
                user,
                request,
                stage,
                nextStage,
                Collections.emptyList()
        );

        assertNotNull(response);
        assertEquals("CANDIDATE_QUESTIONS", response.getNextStage());
        assertEquals("Of course! Please go ahead and ask your question.", response.getNextQuestion());
        assertEquals("CORRECT", response.getEvaluation());
        verifyNoInteractions(geminiService);
    }

    @Test
    void testCandidateQuestionsWhenUserAsksActualQuestion() {
        AnswerRequest request = new AnswerRequest();
        request.setInterviewId(126L);
        request.setCurrentQuestion("Do you have any questions for me?");
        request.setUserAnswer("What does the tech stack look like for this role?");

        String stage = "CANDIDATE_QUESTIONS";
        String nextStage = interviewFlowService.determineCandidateQuestionsStage(
                request.getUserAnswer(), Collections.emptyList()
        );
        assertEquals("CANDIDATE_QUESTIONS", nextStage);

        String mockedGeminiJson = """
                {
                  "evaluation": "CORRECT",
                  "feedback": "",
                  "nextQuestion": "Our team works primarily with modern Java, Spring Boot, and React microservices. Would you like to ask anything else?",
                  "communicationScore": 95,
                  "technicalKnowledgeScore": null,
                  "projectKnowledgeScore": null,
                  "responseQualityScore": 95
                }
                """;
        when(geminiService.generateInterviewResponse(anyString())).thenReturn(mockedGeminiJson);

        AnswerResponse response = questionService.generateInterviewResponse(
                interview,
                user,
                request,
                stage,
                nextStage,
                Collections.emptyList()
        );

        assertNotNull(response);
        assertEquals("CANDIDATE_QUESTIONS", response.getNextStage());
        assertTrue(response.getNextQuestion().contains("Spring Boot"));
        assertTrue(response.getNextQuestion().contains("Would you like to ask anything else?"));
        verify(geminiService, times(1)).generateInterviewResponse(anyString());
    }

    @Test
    void testCandidateQuestionsWhenUserSaysNo() {
        AnswerRequest request = new AnswerRequest();
        request.setInterviewId(126L);
        request.setCurrentQuestion("Do you have any questions for me?");
        request.setUserAnswer("No thank you, that's all");

        String stage = "CANDIDATE_QUESTIONS";
        String nextStage = interviewFlowService.determineCandidateQuestionsStage(
                request.getUserAnswer(), Collections.emptyList()
        );
        assertEquals("CLOSING", nextStage);

        AnswerResponse response = questionService.generateInterviewResponse(
                interview,
                user,
                request,
                stage,
                nextStage,
                Collections.emptyList()
        );

        assertNotNull(response);
        assertEquals("CLOSING", response.getNextStage());
        assertTrue(response.getNextQuestion().contains("Thank you so much for your time today, Yugandhara Patil"));
        verifyNoInteractions(geminiService);
    }

    @Test
    void testCandidateQuestionsWhenUserAudioIsUnclear() {
        AnswerRequest request = new AnswerRequest();
        request.setInterviewId(126L);
        request.setCurrentQuestion("Do you have any questions for me?");
        request.setUserAnswer("");

        String stage = "CANDIDATE_QUESTIONS";
        String nextStage = interviewFlowService.determineCandidateQuestionsStage(
                request.getUserAnswer(), Collections.emptyList()
        );
        assertEquals("CANDIDATE_QUESTIONS", nextStage);

        AnswerResponse response = questionService.generateInterviewResponse(
                interview,
                user,
                request,
                stage,
                nextStage,
                Collections.emptyList()
        );

        assertNotNull(response);
        assertEquals("CANDIDATE_QUESTIONS", response.getNextStage());
        assertEquals("I didn't quite catch that. Could you please repeat your question, or let me know if you don't have any questions?",
                response.getNextQuestion());
        verifyNoInteractions(geminiService);
    }
}
