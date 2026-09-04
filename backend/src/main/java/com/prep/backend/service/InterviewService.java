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
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            UserRepository userRepository
    ) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public StartInterviewResponse startInterview(
            String email,
            StartInterviewRequest request,
            MultipartFile resume
    ) {

        // Find logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        // Validate resume
        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException("Resume is required");
        }

        // Convert frontend string -> enum
        InterviewType interviewType;

        try {
            interviewType = InterviewType.valueOf(
                    request.getInterviewType().toUpperCase()
            );
        } catch (Exception exception) {
            throw new RuntimeException(
                    "Invalid interview type"
            );
        }

        // Convert frontend difficulty -> enum
        Difficulty difficulty;

        try {
            difficulty = Difficulty.valueOf(
                    request.getDifficulty().toUpperCase()
            );
        } catch (Exception exception) {
            throw new RuntimeException(
                    "Invalid difficulty"
            );
        }

        // Create interview entity
        Interview interview = new Interview();

        interview.setUser(user);
        interview.setInterviewType(interviewType);
        interview.setDifficulty(difficulty);
        interview.setTargetRole(
                request.getTargetRole()
        );

        // Technical focus only for technical interview
        if (interviewType == InterviewType.TECHNICAL) {
            interview.setTechnicalFocus(
                    request.getTechnicalFocus()
            );
        } else {
            interview.setTechnicalFocus(null);
        }

        interview.setResumeFileName(
                resume.getOriginalFilename()
        );

        interview.setStatus(
                InterviewStatus.CREATED
        );

        interview.setStartedAt(
                LocalDateTime.now()
        );

        Interview savedInterview =
                interviewRepository.save(interview);

        return new StartInterviewResponse(
                savedInterview.getId(),
                savedInterview
                        .getInterviewType()
                        .name(),
                savedInterview
                        .getDifficulty()
                        .name(),
                savedInterview.getTargetRole(),
                savedInterview.getTechnicalFocus(),
                savedInterview.getResumeFileName(),
                savedInterview
                        .getStatus()
                        .name(),
                "Interview created successfully"
        );
    }
}