package com.prep.backend.dto;

public class InterviewAnswerResultResponse {

    private Long id;
    private String question;
    private String answer;
    private String stage;
    private String evaluation;
    private String feedback;

    private Integer communicationScore;
    private Integer technicalKnowledgeScore;
    private Integer projectKnowledgeScore;
    private Integer responseQualityScore;

    public InterviewAnswerResultResponse() {
    }

    public InterviewAnswerResultResponse(
            Long id,
            String question,
            String answer,
            String stage,
            String evaluation,
            String feedback,
            Integer communicationScore,
            Integer technicalKnowledgeScore,
            Integer projectKnowledgeScore,
            Integer responseQualityScore
    ) {
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.stage = stage;
        this.evaluation = evaluation;
        this.feedback = feedback;
        this.communicationScore = communicationScore;
        this.technicalKnowledgeScore = technicalKnowledgeScore;
        this.projectKnowledgeScore = projectKnowledgeScore;
        this.responseQualityScore = responseQualityScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
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
}