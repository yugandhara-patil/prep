package com.prep.backend.dto;

public class AnswerResponse {

    private String nextQuestion;


    public AnswerResponse() {
    }


    public AnswerResponse(String nextQuestion) {
        this.nextQuestion = nextQuestion;
    }


    public String getNextQuestion() {
        return nextQuestion;
    }

    public void setNextQuestion(String nextQuestion) {
        this.nextQuestion = nextQuestion;
    }
}