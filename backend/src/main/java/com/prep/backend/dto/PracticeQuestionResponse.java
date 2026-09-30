package com.prep.backend.dto;

import java.util.List;

public class PracticeQuestionResponse {

    private String question;
    private List<String> options;
    private int answer;
    private String explanation;

    public PracticeQuestionResponse() {
    }

    public PracticeQuestionResponse(
            String question,
            List<String> options,
            int answer,
            String explanation
    ) {
        this.question = question;
        this.options = options;
        this.answer = answer;
        this.explanation = explanation;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public int getAnswer() {
        return answer;
    }

    public void setAnswer(int answer) {
        this.answer = answer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}