package com.prep.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_type", nullable = false)
    private InterviewType interviewType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "target_role", nullable = false)
    private String targetRole;

    @Column(name = "technical_focus")
    private String technicalFocus;

    @Column(name = "resume_file_name")
    private String resumeFileName;

    @Lob
    @Column(name = "resume_text", columnDefinition = "LONGTEXT")
    private String resumeText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;


    public Interview() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public InterviewType getInterviewType() {
        return interviewType;
    }

    public void setInterviewType(
            InterviewType interviewType
    ) {
        this.interviewType = interviewType;
    }


    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
            Difficulty difficulty
    ) {
        this.difficulty = difficulty;
    }


    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(
            String targetRole
    ) {
        this.targetRole = targetRole;
    }


    public String getTechnicalFocus() {
        return technicalFocus;
    }

    public void setTechnicalFocus(
            String technicalFocus
    ) {
        this.technicalFocus = technicalFocus;
    }


    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(
            String resumeFileName
    ) {
        this.resumeFileName = resumeFileName;
    }


    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(
            String resumeText
    ) {
        this.resumeText = resumeText;
    }


    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(
            InterviewStatus status
    ) {
        this.status = status;
    }


    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(
            LocalDateTime startedAt
    ) {
        this.startedAt = startedAt;
    }


    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(
            LocalDateTime completedAt
    ) {
        this.completedAt = completedAt;
    }
}