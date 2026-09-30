package com.prep.backend.dto;

public class PracticeQuestionRequest {

    private String section;
    private String difficulty;

    public PracticeQuestionRequest() {
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}