package com.prep.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prep.backend.dto.StartInterviewRequest;
import com.prep.backend.dto.StartInterviewResponse;
import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewStatus;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;

@Service
public class InterviewSetupService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final ResumeTextExtractorService resumeTextExtractorService;

    public InterviewSetupService(
            InterviewRepository interviewRepository,
            UserRepository userRepository,
            ResumeTextExtractorService resumeTextExtractorService
    ) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.resumeTextExtractorService = resumeTextExtractorService;
    }

    public StartInterviewResponse startInterview(
            String email,
            StartInterviewRequest request,
            MultipartFile resume
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException("Resume is required");
        }

        InterviewType interviewType;
        try {
            interviewType = InterviewType.valueOf(
                    request.getInterviewType().toUpperCase()
            );
        } catch (Exception exception) {
            throw new RuntimeException("Invalid interview type");
        }

        Difficulty difficulty;
        try {
            difficulty = Difficulty.valueOf(
                    request.getDifficulty().toUpperCase()
            );
        } catch (Exception exception) {
            throw new RuntimeException("Invalid difficulty");
        }

        Interview interview = new Interview();
        interview.setUser(user);
        interview.setInterviewType(interviewType);
        interview.setDifficulty(difficulty);
        interview.setTargetRole(request.getTargetRole());

        if (interviewType == InterviewType.TECHNICAL) {
            interview.setTechnicalFocus(request.getTechnicalFocus());
        } else {
            interview.setTechnicalFocus(null);
        }

        interview.setResumeFileName(resume.getOriginalFilename());

        String resumeText;
        try {
            resumeText = resumeTextExtractorService.extractText(resume);
            interview.setResumeText(resumeText);
        } catch (Exception exception) {
            throw new RuntimeException(
                    "Failed to extract resume text",
                    exception
            );
        }

        interview.setStatus(InterviewStatus.CREATED);
        interview.setStartedAt(LocalDateTime.now());

        Interview savedInterview = interviewRepository.save(interview);

        String firstQuestion =
                "Hello, " + user.getFullName() + ", it's nice to meet you.";

        return new StartInterviewResponse(
                savedInterview.getId(),
                savedInterview.getInterviewType().name(),
                savedInterview.getDifficulty().name(),
                savedInterview.getTargetRole(),
                savedInterview.getTechnicalFocus(),
                savedInterview.getResumeFileName(),
                savedInterview.getStatus().name(),
                "Interview created successfully",
                firstQuestion
        );
    }
}
