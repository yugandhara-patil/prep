package com.prep.backend.dto;

public class StartInterviewRequest {

    private String interviewType;
    private String difficulty;
    private String targetRole;
    private String technicalFocus;

    public StartInterviewRequest() {
    }

    public String getInterviewType() {
        return interviewType;
    }

    public void setInterviewType(String interviewType) {
        this.interviewType = interviewType;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTechnicalFocus() {
        return technicalFocus;
    }

    public void setTechnicalFocus(String technicalFocus) {
        this.technicalFocus = technicalFocus;
    }
}