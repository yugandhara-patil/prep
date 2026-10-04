package com.prep.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_answers")
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String question;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String answer;

    @Column(nullable = false)
    private String stage;

    @Column(nullable = false)
    private String evaluation;

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "technical_knowledge_score")
    private Integer technicalKnowledgeScore;

    @Column(name = "project_knowledge_score")
    private Integer projectKnowledgeScore;

    @Column(name = "response_quality_score")
    private Integer responseQualityScore;


    public InterviewAnswer() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
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