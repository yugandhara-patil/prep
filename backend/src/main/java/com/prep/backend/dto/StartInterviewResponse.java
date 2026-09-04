package com.prep.backend.dto;

public class StartInterviewResponse {

    private Long interviewId;
    private String interviewType;
    private String difficulty;
    private String targetRole;
    private String technicalFocus;
    private String resumeFileName;
    private String status;
    private String message;

    public StartInterviewResponse() {
    }

    public StartInterviewResponse(
            Long interviewId,
            String interviewType,
            String difficulty,
            String targetRole,
            String technicalFocus,
            String resumeFileName,
            String status,
            String message
    ) {
        this.interviewId = interviewId;
        this.interviewType = interviewType;
        this.difficulty = difficulty;
        this.targetRole = targetRole;
        this.technicalFocus = technicalFocus;
        this.resumeFileName = resumeFileName;
        this.status = status;
        this.message = message;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
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

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}