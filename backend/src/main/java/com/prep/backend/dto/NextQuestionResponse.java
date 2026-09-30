package com.prep.backend.dto;

public class NextQuestionResponse {

    private String nextQuestion;

    public NextQuestionResponse() {
    }

    public NextQuestionResponse(String nextQuestion) {
        this.nextQuestion = nextQuestion;
    }

    public String getNextQuestion() {
        return nextQuestion;
    }

    public void setNextQuestion(String nextQuestion) {
        this.nextQuestion = nextQuestion;
    }
}