package com.prep.backend.dto;

public class AnswerResponse {

    private String evaluation;
    private String feedback;
    private String nextQuestion;

    public AnswerResponse() {
    }

    public AnswerResponse(
            String evaluation,
            String feedback,
            String nextQuestion
    ) {
        this.evaluation = evaluation;
        this.feedback = feedback;
        this.nextQuestion = nextQuestion;
    }

    public String getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(String evaluation) {
        this.evaluation = evaluation;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getNextQuestion() {
        return nextQuestion;
    }

    public void setNextQuestion(String nextQuestion) {
        this.nextQuestion = nextQuestion;
    }
}