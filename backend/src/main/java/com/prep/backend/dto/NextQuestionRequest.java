package com.prep.backend.dto;

public class NextQuestionRequest {

    private Long interviewId;
    private String currentQuestion;

    public NextQuestionRequest() {
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    public String getCurrentQuestion() {
        return currentQuestion;
    }

    public void setCurrentQuestion(String currentQuestion) {
        this.currentQuestion = currentQuestion;
    }
}