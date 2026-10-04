package com.prep.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.prep.backend.dto.AnswerRequest;
import com.prep.backend.dto.AnswerResponse;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.repository.InterviewAnswerRepository;

@Service
public class InterviewAnswerService {

    private final InterviewAnswerRepository interviewAnswerRepository;

    public InterviewAnswerService(
            InterviewAnswerRepository interviewAnswerRepository
    ) {
        this.interviewAnswerRepository = interviewAnswerRepository;
    }

    /**
     * Saves the candidate's answer together with the evaluation
     * generated for that answer.
     */
    public InterviewAnswer saveAnswer(
            Interview interview,
            AnswerRequest request,
            AnswerResponse answerResponse,
            String stage
    ) {
        if (interview == null) {
            throw new RuntimeException("Interview is required");
        }

        if (request == null) {
            throw new RuntimeException("Answer request is required");
        }

        if (answerResponse == null) {
            throw new RuntimeException("Answer response is required");
        }

        InterviewAnswer interviewAnswer = new InterviewAnswer();

        interviewAnswer.setInterview(interview);
        interviewAnswer.setQuestion(request.getCurrentQuestion());
        interviewAnswer.setAnswer(request.getUserAnswer());
        interviewAnswer.setStage(stage);

        interviewAnswer.setEvaluation(
                answerResponse.getEvaluation()
        );

        interviewAnswer.setFeedback(
                answerResponse.getFeedback()
        );

        interviewAnswer.setCommunicationScore(
                answerResponse.getCommunicationScore()
        );

        interviewAnswer.setTechnicalKnowledgeScore(
                answerResponse.getTechnicalKnowledgeScore()
        );

        interviewAnswer.setProjectKnowledgeScore(
                answerResponse.getProjectKnowledgeScore()
        );

        interviewAnswer.setResponseQualityScore(
                answerResponse.getResponseQualityScore()
        );

        return interviewAnswerRepository.save(interviewAnswer);
    }

    /**
     * Returns all saved answers for an interview in interview order.
     */
    public List<InterviewAnswer> getAnswers(Interview interview) {
        if (interview == null) {
            throw new RuntimeException("Interview is required");
        }

        return interviewAnswerRepository
                .findByInterviewOrderByIdAsc(interview);
    }
}
