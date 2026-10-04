package com.prep.backend.dto;

import java.util.List;

public class InterviewResultResponse {

    private Long interviewId;
    private String interviewType;
    private String targetRole;
    private String difficulty;
    private String technicalFocus;

    private int totalQuestions;
    private int correctAnswers;
    private int partiallyCorrectAnswers;
    private int incorrectAnswers;

    private Integer overallScore;
    private Integer communicationScore;
    private Integer technicalKnowledgeScore;
    private Integer projectKnowledgeScore;
    private Integer responseQualityScore;

    private List<String> strengths;
    private List<String> areasToImprove;

    private List<InterviewAnswerResultResponse> answers;

    public InterviewResultResponse() {
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

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTechnicalFocus() {
        return technicalFocus;
    }

    public void setTechnicalFocus(String technicalFocus) {
        this.technicalFocus = technicalFocus;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getPartiallyCorrectAnswers() {
        return partiallyCorrectAnswers;
    }

    public void setPartiallyCorrectAnswers(int partiallyCorrectAnswers) {
        this.partiallyCorrectAnswers = partiallyCorrectAnswers;
    }

    public int getIncorrectAnswers() {
        return incorrectAnswers;
    }

    public void setIncorrectAnswers(int incorrectAnswers) {
        this.incorrectAnswers = incorrectAnswers;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(Integer communicationScore) {
        this.communicationScore = communicationScore;
    }

    public Integer getTechnicalKnowledgeScore() {
        return technicalKnowledgeScore;
    }

    public void setTechnicalKnowledgeScore(Integer technicalKnowledgeScore) {
        this.technicalKnowledgeScore = technicalKnowledgeScore;
    }

    public Integer getProjectKnowledgeScore() {
        return projectKnowledgeScore;
    }

    public void setProjectKnowledgeScore(Integer projectKnowledgeScore) {
        this.projectKnowledgeScore = projectKnowledgeScore;
    }

    public Integer getResponseQualityScore() {
        return responseQualityScore;
    }

    public void setResponseQualityScore(Integer responseQualityScore) {
        this.responseQualityScore = responseQualityScore;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getAreasToImprove() {
        return areasToImprove;
    }

    public void setAreasToImprove(List<String> areasToImprove) {
        this.areasToImprove = areasToImprove;
    }

    public List<InterviewAnswerResultResponse> getAnswers() {
        return answers;
    }

    public void setAnswers(List<InterviewAnswerResultResponse> answers) {
        this.answers = answers;
    }
}