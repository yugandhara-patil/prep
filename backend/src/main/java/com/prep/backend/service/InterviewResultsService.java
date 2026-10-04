package com.prep.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.prep.backend.dto.InterviewAnswerResultResponse;
import com.prep.backend.dto.InterviewResultResponse;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;

@Service
public class InterviewResultsService {

    private final InterviewRepository interviewRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
    private final UserRepository userRepository;

    public InterviewResultsService(
            InterviewRepository interviewRepository,
            InterviewAnswerRepository interviewAnswerRepository,
            UserRepository userRepository
    ) {
        this.interviewRepository = interviewRepository;
        this.interviewAnswerRepository = interviewAnswerRepository;
        this.userRepository = userRepository;
    }

    public InterviewResultResponse getInterviewResults(
    
    
    
                String email,
    
    
    
                Long interviewId
    
    
    
        ) {
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // FIND LOGGED-IN USER
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            User user = userRepository.findByEmail(email)
    
    
    
                    .orElseThrow(
    
    
    
                            () -> new RuntimeException("User not found")
    
    
    
                    );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // VALIDATE INTERVIEW ID
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            if (interviewId == null) {
    
    
    
                throw new RuntimeException("Interview ID is required");
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // FIND INTERVIEW
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            Interview interview =
    
    
    
                    interviewRepository.findById(interviewId)
    
    
    
                            .orElseThrow(
    
    
    
                                    () -> new RuntimeException(
    
    
    
                                            "Interview not found"
    
    
    
                                    )
    
    
    
                            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // VERIFY OWNERSHIP
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            if (interview.getUser() == null
    
    
    
                    || !interview.getUser().getId().equals(user.getId())) {
    
    
    
    
    
    
    
                throw new RuntimeException(
    
    
    
                        "You are not authorised to access this interview"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // GET ALL ANSWERS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            List<InterviewAnswer> interviewAnswers =
    
    
    
                    interviewAnswerRepository
    
    
    
                            .findByInterviewOrderByIdAsc(interview);
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CREATE RESULT RESPONSE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            InterviewResultResponse response =
    
    
    
                    new InterviewResultResponse();
    
    
    
    
    
    
    
            response.setInterviewId(
    
    
    
                    interview.getId()
    
    
    
            );
    
    
    
    
    
    
    
            response.setInterviewType(
    
    
    
                    interview.getInterviewType() != null
    
    
    
                            ? interview.getInterviewType().name()
    
    
    
                            : null
    
    
    
            );
    
    
    
    
    
    
    
            response.setTargetRole(
    
    
    
                    interview.getTargetRole()
    
    
    
            );
    
    
    
    
    
    
    
            response.setDifficulty(
    
    
    
                    interview.getDifficulty() != null
    
    
    
                            ? interview.getDifficulty().name()
    
    
    
                            : null
    
    
    
            );
    
    
    
    
    
    
    
            response.setTechnicalFocus(
    
    
    
                    interview.getTechnicalFocus()
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // COUNTERS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            int correctAnswers = 0;
    
    
    
            int partiallyCorrectAnswers = 0;
    
    
    
            int incorrectAnswers = 0;
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // SCORE TOTALS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            int communicationTotal = 0;
    
    
    
            int communicationCount = 0;
    
    
    
    
    
    
    
            int technicalTotal = 0;
    
    
    
            int technicalCount = 0;
    
    
    
    
    
    
    
            int projectTotal = 0;
    
    
    
            int projectCount = 0;
    
    
    
    
    
    
    
            int responseQualityTotal = 0;
    
    
    
            int responseQualityCount = 0;
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // ANSWER RESULTS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            List<InterviewAnswerResultResponse> answerResults =
    
    
    
                    new ArrayList<>();
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // PROCESS EACH ANSWER
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            for (InterviewAnswer answer : interviewAnswers) {
    
    
    
    
    
    
    
                // Evaluation count
    
    
    
                if ("CORRECT".equalsIgnoreCase(
    
    
    
                        answer.getEvaluation()
    
    
    
                )) {
    
    
    
    
    
    
    
                    correctAnswers++;
    
    
    
    
    
    
    
                } else if ("PARTIALLY_CORRECT".equalsIgnoreCase(
    
    
    
                        answer.getEvaluation()
    
    
    
                )) {
    
    
    
    
    
    
    
                    partiallyCorrectAnswers++;
    
    
    
    
    
    
    
                } else if ("INCORRECT".equalsIgnoreCase(
    
    
    
                        answer.getEvaluation()
    
    
    
                )) {
    
    
    
    
    
    
    
                    incorrectAnswers++;
    
    
    
                }
    
    
    
    
    
    
    
    
    
    
    
                // Communication score
    
    
    
                if (answer.getCommunicationScore() != null) {
    
    
    
    
    
    
    
                    communicationTotal +=
    
    
    
                            answer.getCommunicationScore();
    
    
    
    
    
    
    
                    communicationCount++;
    
    
    
                }
    
    
    
    
    
    
    
    
    
    
    
                // Technical knowledge score
    
    
    
                if (answer.getTechnicalKnowledgeScore() != null) {
    
    
    
    
    
    
    
                    technicalTotal +=
    
    
    
                            answer.getTechnicalKnowledgeScore();
    
    
    
    
    
    
    
                    technicalCount++;
    
    
    
                }
    
    
    
    
    
    
    
    
    
    
    
                // Project knowledge score
    
    
    
                if (answer.getProjectKnowledgeScore() != null) {
    
    
    
    
    
    
    
                    projectTotal +=
    
    
    
                            answer.getProjectKnowledgeScore();
    
    
    
    
    
    
    
                    projectCount++;
    
    
    
                }
    
    
    
    
    
    
    
    
    
    
    
                // Response quality score
    
    
    
                if (answer.getResponseQualityScore() != null) {
    
    
    
    
    
    
    
                    responseQualityTotal +=
    
    
    
                            answer.getResponseQualityScore();
    
    
    
    
    
    
    
                    responseQualityCount++;
    
    
    
                }
    
    
    
    
    
    
    
    
    
    
    
                // Convert entity to response DTO
    
    
    
                InterviewAnswerResultResponse answerResponse =
    
    
    
                        new InterviewAnswerResultResponse(
    
    
    
    
    
    
    
                                answer.getId(),
    
    
    
    
    
    
    
                                answer.getQuestion(),
    
    
    
    
    
    
    
                                answer.getAnswer(),
    
    
    
    
    
    
    
                                answer.getStage(),
    
    
    
    
    
    
    
                                answer.getEvaluation(),
    
    
    
    
    
    
    
                                answer.getFeedback(),
    
    
    
    
    
    
    
                                answer.getCommunicationScore(),
    
    
    
    
    
    
    
                                answer.getTechnicalKnowledgeScore(),
    
    
    
    
    
    
    
                                answer.getProjectKnowledgeScore(),
    
    
    
    
    
    
    
                                answer.getResponseQualityScore()
    
    
    
                        );
    
    
    
    
    
    
    
                answerResults.add(
    
    
    
                        answerResponse
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // SET QUESTION COUNTS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            int totalQuestions =
    
    
    
                    interviewAnswers.size();
    
    
    
    
    
    
    
            response.setTotalQuestions(
    
    
    
                    totalQuestions
    
    
    
            );
    
    
    
    
    
    
    
            response.setCorrectAnswers(
    
    
    
                    correctAnswers
    
    
    
            );
    
    
    
    
    
    
    
            response.setPartiallyCorrectAnswers(
    
    
    
                    partiallyCorrectAnswers
    
    
    
            );
    
    
    
    
    
    
    
            response.setIncorrectAnswers(
    
    
    
                    incorrectAnswers
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CALCULATE AVERAGE COMMUNICATION SCORE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            Integer communicationScore = null;
    
    
    
    
    
    
    
            if (communicationCount > 0) {
    
    
    
    
    
    
    
                communicationScore =
    
    
    
                        Math.round(
    
    
    
                                (float) communicationTotal
    
    
    
                                        / communicationCount
    
    
    
                        );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CALCULATE AVERAGE TECHNICAL SCORE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            Integer technicalKnowledgeScore = null;
    
    
    
    
    
    
    
            if (technicalCount > 0) {
    
    
    
    
    
    
    
                technicalKnowledgeScore =
    
    
    
                        Math.round(
    
    
    
                                (float) technicalTotal
    
    
    
                                        / technicalCount
    
    
    
                        );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CALCULATE AVERAGE PROJECT SCORE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            Integer projectKnowledgeScore = null;
    
    
    
    
    
    
    
            if (projectCount > 0) {
    
    
    
    
    
    
    
                projectKnowledgeScore =
    
    
    
                        Math.round(
    
    
    
                                (float) projectTotal
    
    
    
                                        / projectCount
    
    
    
                        );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CALCULATE AVERAGE RESPONSE QUALITY SCORE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            Integer responseQualityScore = null;
    
    
    
    
    
    
    
            if (responseQualityCount > 0) {
    
    
    
    
    
    
    
                responseQualityScore =
    
    
    
                        Math.round(
    
    
    
                                (float) responseQualityTotal
    
    
    
                                        / responseQualityCount
    
    
    
                        );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            response.setCommunicationScore(
    
    
    
                    communicationScore
    
    
    
            );
    
    
    
    
    
    
    
            response.setTechnicalKnowledgeScore(
    
    
    
                    technicalKnowledgeScore
    
    
    
            );
    
    
    
    
    
    
    
            response.setProjectKnowledgeScore(
    
    
    
                    projectKnowledgeScore
    
    
    
            );
    
    
    
    
    
    
    
            response.setResponseQualityScore(
    
    
    
                    responseQualityScore
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // CALCULATE OVERALL SCORE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            int overallTotal = 0;
    
    
    
            int overallCount = 0;
    
    
    
    
    
    
    
            if (communicationScore != null) {
    
    
    
    
    
    
    
                overallTotal += communicationScore;
    
    
    
                overallCount++;
    
    
    
            }
    
    
    
    
    
    
    
            if (technicalKnowledgeScore != null) {
    
    
    
    
    
    
    
                overallTotal += technicalKnowledgeScore;
    
    
    
                overallCount++;
    
    
    
            }
    
    
    
    
    
    
    
            if (projectKnowledgeScore != null) {
    
    
    
    
    
    
    
                overallTotal += projectKnowledgeScore;
    
    
    
                overallCount++;
    
    
    
            }
    
    
    
    
    
    
    
            if (responseQualityScore != null) {
    
    
    
    
    
    
    
                overallTotal += responseQualityScore;
    
    
    
                overallCount++;
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            Integer overallScore = null;
    
    
    
    
    
    
    
            if (overallCount > 0) {
    
    
    
    
    
    
    
                overallScore =
    
    
    
                        Math.round(
    
    
    
                                (float) overallTotal
    
    
    
                                        / overallCount
    
    
    
                        );
    
    
    
            }
    
    
    
    
    
    
    
            response.setOverallScore(
    
    
    
                    overallScore
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // STRENGTHS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            List<String> strengths =
    
    
    
                    new ArrayList<>();
    
    
    
    
    
    
    
            if (communicationScore != null
    
    
    
                    && communicationScore >= 70) {
    
    
    
    
    
    
    
                strengths.add(
    
    
    
                        "Strong communication and clarity"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (technicalKnowledgeScore != null
    
    
    
                    && technicalKnowledgeScore >= 70) {
    
    
    
    
    
    
    
                strengths.add(
    
    
    
                        "Good technical knowledge"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (projectKnowledgeScore != null
    
    
    
                    && projectKnowledgeScore >= 70) {
    
    
    
    
    
    
    
                strengths.add(
    
    
    
                        "Good understanding of projects"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (responseQualityScore != null
    
    
    
                    && responseQualityScore >= 70) {
    
    
    
    
    
    
    
                strengths.add(
    
    
    
                        "Strong response quality and relevance"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // AREAS TO IMPROVE
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            List<String> areasToImprove =
    
    
    
                    new ArrayList<>();
    
    
    
    
    
    
    
            if (communicationScore != null
    
    
    
                    && communicationScore < 70) {
    
    
    
    
    
    
    
                areasToImprove.add(
    
    
    
                        "Improve communication clarity and structure"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (technicalKnowledgeScore != null
    
    
    
                    && technicalKnowledgeScore < 70) {
    
    
    
    
    
    
    
                areasToImprove.add(
    
    
    
                        "Strengthen technical knowledge"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (projectKnowledgeScore != null
    
    
    
                    && projectKnowledgeScore < 70) {
    
    
    
    
    
    
    
                areasToImprove.add(
    
    
    
                        "Improve project understanding and explanation"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
            if (responseQualityScore != null
    
    
    
                    && responseQualityScore < 70) {
    
    
    
    
    
    
    
                areasToImprove.add(
    
    
    
                        "Improve answer relevance, completeness, and reasoning"
    
    
    
                );
    
    
    
            }
    
    
    
    
    
    
    
    
    
    
    
            response.setStrengths(
    
    
    
                    strengths
    
    
    
            );
    
    
    
    
    
    
    
            response.setAreasToImprove(
    
    
    
                    areasToImprove
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // INDIVIDUAL ANSWERS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            response.setAnswers(
    
    
    
                    answerResults
    
    
    
            );
    
    
    
    
    
    
    
    
    
    
    
            // ---------------------------------------------------------
    
    
    
            // RETURN FINAL RESULTS
    
    
    
            // ---------------------------------------------------------
    
    
    
    
    
    
    
            return response;
    
    
    
        }
    
    
    
    
    
    
    
    
    
    
    
        
}
