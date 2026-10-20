package com.prep.backend.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.InterviewStatus;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OverallPerformanceServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewAnswerRepository interviewAnswerRepository;

    private OverallPerformanceService performanceService;

    @BeforeEach
    void setUp() {
        performanceService = new OverallPerformanceService(interviewRepository, interviewAnswerRepository);
    }

    @Test
    void testEmptyPerformanceResponse() {
        User user = new User();
        user.setId(1L);

        when(interviewRepository.findByUserOrderByStartedAtDesc(user))
                .thenReturn(Collections.emptyList());

        Map<String, Object> result = performanceService.getOverallPerformance(user);

        assertNotNull(result);
        assertEquals(0, result.get("totalInterviews"));
        assertEquals(0, ((Number) result.get("averageScore")).intValue());
        assertEquals(0, ((Number) result.get("bestScore")).intValue());
        assertEquals(0L, ((Number) result.get("totalPracticeMinutes")).longValue());
        assertTrue(((List<?>) result.get("recentInterviews")).isEmpty());
        assertTrue(((List<?>) result.get("unfinishedInterviews")).isEmpty());
    }

    @Test
    void testSeparationOfCompletedAndUnfinishedInterviews() {
        User user = new User();
        user.setId(1L);

        // 1 Completed interview
        Interview completed = new Interview();
        completed.setId(101L);
        completed.setUser(user);
        completed.setStatus(InterviewStatus.COMPLETED);
        completed.setInterviewType(InterviewType.TECHNICAL);
        completed.setTargetRole("Backend Engineer");
        completed.setDifficulty(Difficulty.MEDIUM);
        completed.setStartedAt(LocalDateTime.now().minusMinutes(20));
        completed.setCompletedAt(LocalDateTime.now());

        InterviewAnswer answer = new InterviewAnswer();
        answer.setInterview(completed);
        answer.setCommunicationScore(80);
        answer.setTechnicalKnowledgeScore(90);
        answer.setProjectKnowledgeScore(85);
        answer.setResponseQualityScore(85);

        // 1 In-progress (unfinished) interview
        Interview inProgress = new Interview();
        inProgress.setId(102L);
        inProgress.setUser(user);
        inProgress.setStatus(InterviewStatus.IN_PROGRESS);
        inProgress.setInterviewType(InterviewType.HR);
        inProgress.setTargetRole("Product Manager");
        inProgress.setDifficulty(Difficulty.MEDIUM);
        inProgress.setStartedAt(LocalDateTime.now().minusMinutes(5));

        when(interviewRepository.findByUserOrderByStartedAtDesc(user))
                .thenReturn(List.of(inProgress, completed));

        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(completed))
                .thenReturn(List.of(answer));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(inProgress))
                .thenReturn(Collections.emptyList());

        Map<String, Object> result = performanceService.getOverallPerformance(user);

        assertNotNull(result);
        assertEquals(1, result.get("totalInterviews")); // Only completed
        assertEquals(85.0, (Double) result.get("averageScore"), 0.5);

        List<?> completedList = (List<?>) result.get("recentInterviews");
        assertEquals(1, completedList.size());

        List<?> unfinishedList = (List<?>) result.get("unfinishedInterviews");
        assertEquals(1, unfinishedList.size());

        @SuppressWarnings("unchecked")
        Map<String, Object> unfinishedSession = (Map<String, Object>) unfinishedList.get(0);
        assertEquals(102L, unfinishedSession.get("interviewId"));
        assertEquals("HR", unfinishedSession.get("interviewType"));
        assertEquals("IN_PROGRESS", unfinishedSession.get("status"));
    }

    @Test
    void testAreasForImprovementWhenWeaknessesExist() {
        User user = new User();
        user.setId(1L);

        Interview completed = new Interview();
        completed.setId(201L);
        completed.setUser(user);
        completed.setStatus(InterviewStatus.COMPLETED);
        completed.setInterviewType(InterviewType.TECHNICAL);
        completed.setTargetRole("Backend Engineer");
        completed.setDifficulty(Difficulty.MEDIUM);
        completed.setStartedAt(LocalDateTime.now().minusMinutes(25));
        completed.setCompletedAt(LocalDateTime.now());

        InterviewAnswer ans1 = new InterviewAnswer();
        ans1.setInterview(completed);
        ans1.setStage("TECHNICAL_QUESTIONS");
        ans1.setEvaluation("INCORRECT");
        ans1.setCommunicationScore(50);
        ans1.setTechnicalKnowledgeScore(45);
        ans1.setProjectKnowledgeScore(50);
        ans1.setResponseQualityScore(40);
        ans1.setFeedback("Did not explain database index structure.");

        InterviewAnswer ans2 = new InterviewAnswer();
        ans2.setInterview(completed);
        ans2.setStage("TECHNICAL_QUESTIONS");
        ans2.setEvaluation("PARTIALLY_CORRECT");
        ans2.setCommunicationScore(60);
        ans2.setTechnicalKnowledgeScore(55);
        ans2.setProjectKnowledgeScore(60);
        ans2.setResponseQualityScore(55);
        ans2.setFeedback("Partial explanation of concurrency locks.");

        when(interviewRepository.findByUserOrderByStartedAtDesc(user))
                .thenReturn(List.of(completed));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(completed))
                .thenReturn(List.of(ans1, ans2));

        Map<String, Object> result = performanceService.getOverallPerformance(user);

        assertNotNull(result);
        @SuppressWarnings("unchecked")
        List<String> areas = (List<String>) result.get("areasToImprove");
        assertNotNull(areas);
        assertFalse(areas.isEmpty(), "Areas for improvement should not be empty when weaknesses exist");
        assertTrue(areas.size() >= 1);
        // Ensure recommendations contain actionable, evidence-based text
        boolean hasActionableText = areas.stream().anyMatch(a ->
                a.toLowerCase().contains("technical") ||
                a.toLowerCase().contains("accuracy") ||
                a.toLowerCase().contains("communication") ||
                a.toLowerCase().contains("response")
        );
        assertTrue(hasActionableText);
    }

    @Test
    void testMultipleCompletedInterviewsPracticeDurationCalculation() {
        User user = new User();
        user.setId(1L);

        LocalDateTime now = LocalDateTime.now();

        // Completed 1: 35 minutes
        Interview interview1 = new Interview();
        interview1.setId(301L);
        interview1.setUser(user);
        interview1.setStatus(InterviewStatus.COMPLETED);
        interview1.setInterviewType(InterviewType.TECHNICAL);
        interview1.setTargetRole("Frontend Engineer");
        interview1.setDifficulty(Difficulty.MEDIUM);
        interview1.setStartedAt(now.minusMinutes(35));
        interview1.setCompletedAt(now);

        // Completed 2: 50 minutes
        Interview interview2 = new Interview();
        interview2.setId(302L);
        interview2.setUser(user);
        interview2.setStatus(InterviewStatus.COMPLETED);
        interview2.setInterviewType(InterviewType.HR);
        interview2.setTargetRole("Engineering Manager");
        interview2.setDifficulty(Difficulty.HARD);
        interview2.setStartedAt(now.minusMinutes(50));
        interview2.setCompletedAt(now);

        // Completed 3: 1 hour 20 minutes (80 minutes)
        Interview interview3 = new Interview();
        interview3.setId(303L);
        interview3.setUser(user);
        interview3.setStatus(InterviewStatus.COMPLETED);
        interview3.setInterviewType(InterviewType.TECHNICAL);
        interview3.setTargetRole("Full Stack Engineer");
        interview3.setDifficulty(Difficulty.MEDIUM);
        interview3.setStartedAt(now.minusMinutes(80));
        interview3.setCompletedAt(now);

        // Unfinished / In-Progress interview: should be excluded from totalPracticeSeconds & totalInterviews
        Interview inProgress = new Interview();
        inProgress.setId(304L);
        inProgress.setUser(user);
        inProgress.setStatus(InterviewStatus.IN_PROGRESS);
        inProgress.setInterviewType(InterviewType.TECHNICAL);
        inProgress.setTargetRole("DevOps Engineer");
        inProgress.setDifficulty(Difficulty.MEDIUM);
        inProgress.setStartedAt(now.minusMinutes(10));

        // Cancelled interview: should be excluded from totalPracticeSeconds & totalInterviews
        Interview cancelled = new Interview();
        cancelled.setId(305L);
        cancelled.setUser(user);
        cancelled.setStatus(InterviewStatus.CANCELLED);
        cancelled.setInterviewType(InterviewType.HR);
        cancelled.setTargetRole("Product Designer");
        cancelled.setDifficulty(Difficulty.EASY);
        cancelled.setStartedAt(now.minusMinutes(40));
        cancelled.setCompletedAt(now.minusMinutes(30));

        when(interviewRepository.findByUserOrderByStartedAtDesc(user))
                .thenReturn(List.of(interview1, interview2, interview3, inProgress, cancelled));

        InterviewAnswer dummyAnswer = new InterviewAnswer();
        dummyAnswer.setStage("TECHNICAL_QUESTIONS");
        dummyAnswer.setCommunicationScore(80);
        dummyAnswer.setTechnicalKnowledgeScore(85);
        dummyAnswer.setProjectKnowledgeScore(80);
        dummyAnswer.setResponseQualityScore(85);

        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview1))
                .thenReturn(List.of(dummyAnswer));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview2))
                .thenReturn(List.of(dummyAnswer));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview3))
                .thenReturn(List.of(dummyAnswer));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(inProgress))
                .thenReturn(Collections.emptyList());
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(cancelled))
                .thenReturn(Collections.emptyList());

        Map<String, Object> result = performanceService.getOverallPerformance(user);

        assertNotNull(result);
        // Only the 3 completed interviews should be counted
        assertEquals(3, result.get("totalInterviews"));

        // Sum of durations: 35 min + 50 min + 80 min = 165 min = 9900 seconds
        long totalSeconds = ((Number) result.get("totalPracticeSeconds")).longValue();
        assertEquals(9900L, totalSeconds);

        long totalMinutes = ((Number) result.get("totalPracticeMinutes")).longValue();
        assertEquals(165L, totalMinutes);

        // Unfinished list should contain the in-progress and cancelled sessions
        List<?> unfinishedList = (List<?>) result.get("unfinishedInterviews");
        assertEquals(2, unfinishedList.size());
    }
}
