package com.prep.backend.service;

import java.util.List;
import java.time.LocalDateTime;

import com.prep.backend.entity.InterviewStatus;

import org.springframework.stereotype.Service;

import com.prep.backend.dto.AnswerRequest;
import com.prep.backend.dto.AnswerResponse;
import com.prep.backend.dto.InterviewResultResponse;
import com.prep.backend.dto.NextQuestionRequest;
import com.prep.backend.dto.NextQuestionResponse;
import com.prep.backend.dto.StartInterviewRequest;
import com.prep.backend.dto.StartInterviewResponse;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
    private final UserRepository userRepository;

    private final InterviewSetupService interviewSetupService;
    private final InterviewFlowService interviewFlowService;
    private final InterviewQuestionService interviewQuestionService;
    private final InterviewAnswerService interviewAnswerService;
    private final InterviewResultsService interviewResultsService;

    public InterviewService(
            InterviewRepository interviewRepository,
            InterviewAnswerRepository interviewAnswerRepository,
            UserRepository userRepository,
            InterviewSetupService interviewSetupService,
            InterviewFlowService interviewFlowService,
            InterviewQuestionService interviewQuestionService,
            InterviewAnswerService interviewAnswerService,
            InterviewResultsService interviewResultsService
    ) {
        this.interviewRepository = interviewRepository;
        this.interviewAnswerRepository = interviewAnswerRepository;
        this.userRepository = userRepository;
        this.interviewSetupService = interviewSetupService;
        this.interviewFlowService = interviewFlowService;
        this.interviewQuestionService = interviewQuestionService;
        this.interviewAnswerService = interviewAnswerService;
        this.interviewResultsService = interviewResultsService;
    }

    /**
     * Creates a new interview.
     *
     * Interview creation and resume extraction are handled by
     * InterviewSetupService.
     */
    public StartInterviewResponse startInterview(
            String email,
            StartInterviewRequest request,
            org.springframework.web.multipart.MultipartFile resume
    ) {
        return interviewSetupService.startInterview(
                email,
                request,
                resume
        );
    }

    /**
     * Processes one candidate answer.
     *
     * This method coordinates:
     * 1. authentication/ownership validation
     * 2. stage progression
     * 3. Gemini evaluation/question generation
     * 4. answer persistence
     */
    public AnswerResponse processAnswer(
            String email,
            AnswerRequest request
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request == null) {
            throw new RuntimeException("Answer request is required");
        }

        if (request.getInterviewId() == null) {
            throw new RuntimeException("Interview ID is required");
        }

        if (request.getUserAnswer() == null
                || request.getUserAnswer().trim().isEmpty()) {
            throw new RuntimeException("Answer cannot be empty");
        }

        if (request.getCurrentQuestion() == null
                || request.getCurrentQuestion().trim().isEmpty()) {
            throw new RuntimeException("Current question is required");
        }

        Interview interview = interviewRepository.findById(
                request.getInterviewId()
        ).orElseThrow(() -> new RuntimeException("Interview not found"));

        validateOwnership(interview, user);

        String stage = request.getStage();

        if (stage == null || stage.trim().isEmpty()) {
            stage = "GREETING";
        }

        stage = stage.trim().toUpperCase();

        String nextStage;

        if ("START_PERMISSION".equals(stage)
                && interview.getInterviewType() != InterviewType.HR) {

            nextStage = interviewFlowService.determineStartPermissionStage(
                    request.getUserAnswer()
            );

        } else {

            nextStage = interviewFlowService.determineNextStage(
                    interview.getInterviewType(),
                    stage
            );
        }

        List<InterviewAnswer> previousAnswers =
                interviewAnswerRepository.findByInterviewOrderByIdAsc(
                        interview
                );

        AnswerResponse answerResponse =
                interviewQuestionService.generateInterviewResponse(
                        interview,
                        user,
                        request,
                        stage,
                        nextStage,
                        previousAnswers
                );

        if (answerResponse == null) {
            throw new RuntimeException(
                    "No interview response was generated"
            );
        }

        answerResponse.setNextStage(nextStage);

        /*
         * Persist the candidate's answer only after Gemini has produced
         * a valid evaluation and next question.
         */
       interviewAnswerService.saveAnswer(
        interview,
        request,
        answerResponse,
        stage
);

// Mark the interview as completed when the closing stage is reached.
if ("CLOSING".equals(nextStage)) {

    interview.setStatus(
            InterviewStatus.COMPLETED
    );

    interview.setCompletedAt(
            LocalDateTime.now()
    );

    interviewRepository.save(
            interview
    );
}

        return answerResponse;    }

    /**
     * Generates the next question when the frontend explicitly requests one.
     */
    public NextQuestionResponse generateNextQuestion(
            String email,
            NextQuestionRequest request
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request == null) {
            throw new RuntimeException("Next question request is required");
        }

        if (request.getInterviewId() == null) {
            throw new RuntimeException("Interview ID is required");
        }

        Interview interview = interviewRepository.findById(
                request.getInterviewId()
        ).orElseThrow(() -> new RuntimeException("Interview not found"));

        validateOwnership(interview, user);

        return interviewQuestionService.generateNextQuestion(
                interview,
                user,
                request
        );
    }

    /**
     * Returns the completed interview results.
     */
    public InterviewResultResponse getInterviewResults(
            String email,
            Long interviewId
    ) {
        return interviewResultsService.getInterviewResults(
                email,
                interviewId
        );
    }

    /**
     * Verifies that the logged-in user owns the requested interview.
     */
    private void validateOwnership(
            Interview interview,
            User user
    ) {
        if (interview.getUser() == null
                || user == null
                || interview.getUser().getId() == null
                || user.getId() == null
                || !interview.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorised to access this interview"
            );
        }
    }
}
