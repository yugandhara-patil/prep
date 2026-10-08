package com.prep.backend.dto;

public class AnswerResponse {

    private String evaluation;
    private String feedback;
    private String nextQuestion;
    private String nextStage;
    private String nextCondition;
    private String nextHow;

    private Integer communicationScore;
    private Integer technicalKnowledgeScore;
    private Integer projectKnowledgeScore;
    private Integer responseQualityScore;

    public AnswerResponse() {}

    public AnswerResponse(
            String evaluation,
            String feedback,
            String nextQuestion,
            String nextStage,
            Integer communicationScore,
            Integer technicalKnowledgeScore,
            Integer projectKnowledgeScore,
            Integer responseQualityScore
    ) {
        this.evaluation = evaluation;
        this.feedback = feedback;
        this.nextQuestion = nextQuestion;
        this.nextStage = nextStage;
        this.communicationScore = communicationScore;
        this.technicalKnowledgeScore = technicalKnowledgeScore;
        this.projectKnowledgeScore = projectKnowledgeScore;
        this.responseQualityScore = responseQualityScore;
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

public String getNextStage() {
    return nextStage;
}

public void setNextStage(String nextStage) {
    this.nextStage = nextStage;
}

public String getNextCondition() {
    return nextCondition;
}

public void setNextCondition(String nextCondition) {
    this.nextCondition = nextCondition;
}

public String getNextHow() {
    return nextHow;
}

public void setNextHow(String nextHow) {
    this.nextHow = nextHow;
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