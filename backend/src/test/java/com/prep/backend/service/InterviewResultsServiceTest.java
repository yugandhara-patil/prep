package com.prep.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.prep.backend.dto.InterviewResultResponse;
import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewResultsServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewAnswerRepository interviewAnswerRepository;

    @Mock
    private UserRepository userRepository;

    private InterviewResultsService resultsService;

    @BeforeEach
    void setUp() {
        resultsService = new InterviewResultsService(interviewRepository, interviewAnswerRepository, userRepository);
    }

    @Test
    void testGetInterviewResultsSuccessWithAccurateDurationAndScores() {
        String email = "test@example.com";
        Long interviewId = 100L;

        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        Interview interview = new Interview();
        interview.setId(interviewId);
        interview.setUser(user);
        interview.setInterviewType(InterviewType.TECHNICAL);
        interview.setTargetRole("Java Developer");
        interview.setDifficulty(Difficulty.MEDIUM);
        interview.setStartedAt(LocalDateTime.now().minusSeconds(150));
        interview.setCompletedAt(LocalDateTime.now());

        InterviewAnswer ans1 = new InterviewAnswer();
        ans1.setId(1L);
        ans1.setInterview(interview);
        ans1.setQuestion("Explain Dependency Injection in Spring");
        ans1.setAnswer("It allows decoupling components by injecting beans.");
        ans1.setEvaluation("CORRECT");
        ans1.setFeedback("Accurate and concise.");
        ans1.setStage("TECHNICAL_1");
        ans1.setCommunicationScore(90);
        ans1.setTechnicalKnowledgeScore(95);
        ans1.setProjectKnowledgeScore(85);
        ans1.setResponseQualityScore(90);

        InterviewAnswer ans2 = new InterviewAnswer();
        ans2.setId(2L);
        ans2.setInterview(interview);
        ans2.setQuestion("What is the difference between @Component and @Service?");
        ans2.setAnswer("They are functionally similar stereotype annotations.");
        ans2.setEvaluation("PARTIALLY_CORRECT");
        ans2.setFeedback("Correct, though @Service indicates the service layer.");
        ans2.setStage("TECHNICAL_2");
        ans2.setCommunicationScore(80);
        ans2.setTechnicalKnowledgeScore(70);
        ans2.setProjectKnowledgeScore(70);
        ans2.setResponseQualityScore(75);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(interview));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview)).thenReturn(List.of(ans1, ans2));

        InterviewResultResponse result = resultsService.getInterviewResults(email, interviewId);

        assertNotNull(result);
        assertEquals(interviewId, result.getInterviewId());
        assertEquals("TECHNICAL", result.getInterviewType());
        assertEquals("Java Developer", result.getTargetRole());
        assertEquals(2, result.getTotalQuestions());
        assertEquals(1, result.getCorrectAnswers());
        assertEquals(1, result.getPartiallyCorrectAnswers());
        assertEquals(0, result.getIncorrectAnswers());
        assertTrue(result.getTimeSeconds() >= 149 && result.getTimeSeconds() <= 151, "Duration should match elapsed time");
        assertEquals(2, result.getAnswers().size());
        assertEquals("Explain Dependency Injection in Spring", result.getAnswers().get(0).getQuestion());
        assertEquals("It allows decoupling components by injecting beans.", result.getAnswers().get(0).getAnswer());
    }
}
