package com.prep.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.prep.backend.dto.AnswerRequest;
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
    private final ResumeTextExtractorService resumeTextExtractorService;
    private final GeminiService geminiService;

    public InterviewService(
            InterviewRepository interviewRepository,
            UserRepository userRepository,
            ResumeTextExtractorService resumeTextExtractorService,
            GeminiService geminiService
    ) {
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.resumeTextExtractorService = resumeTextExtractorService;
        this.geminiService = geminiService;
    }

    // =========================================================
    // START INTERVIEW
    // =========================================================

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

        // =====================================================
        // CONVERT INTERVIEW TYPE
        // =====================================================

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

        // =====================================================
        // CONVERT DIFFICULTY
        // =====================================================

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

        // =====================================================
        // CREATE INTERVIEW
        // =====================================================

        Interview interview = new Interview();

        interview.setUser(user);

        interview.setInterviewType(
                interviewType
        );

        interview.setDifficulty(
                difficulty
        );

        interview.setTargetRole(
                request.getTargetRole()
        );

        // =====================================================
        // TECHNICAL FOCUS
        // =====================================================

        if (interviewType == InterviewType.TECHNICAL) {

            interview.setTechnicalFocus(
                    request.getTechnicalFocus()
            );

        } else {

            interview.setTechnicalFocus(null);
        }

        // =====================================================
        // RESUME FILE NAME
        // =====================================================

        interview.setResumeFileName(
                resume.getOriginalFilename()
        );

        // =====================================================
        // EXTRACT RESUME TEXT
        // =====================================================

      String resumeText;

try {

    resumeText =
            resumeTextExtractorService.extractText(
                    resume
            );

    interview.setResumeText(
            resumeText
    );

} catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to extract resume text",
                    exception
            );
        }

        // =====================================================
        // INTERVIEW STATUS
        // =====================================================

        interview.setStatus(
                InterviewStatus.CREATED
        );

        // =====================================================
        // INTERVIEW START TIME
        // =====================================================

        interview.setStartedAt(
                LocalDateTime.now()
        );

        // =====================================================
        // SAVE INTERVIEW
        // =====================================================

        Interview savedInterview =
                interviewRepository.save(
                        interview
                );

        // =====================================================
        // FIRST INTERVIEW TURN
        // =====================================================

        /*
         * The interview should NOT immediately begin
         * with a technical question.
         *
         * This is a virtual interview, so Maya should
         * greet the candidate naturally.
         */

        String prompt =
        "You are conducting a realistic professional virtual interview.\n\n"

        + "Interview Type: " + request.getInterviewType() + "\n"
        + "Target Role: " + request.getTargetRole() + "\n"
        + "Difficulty: " + request.getDifficulty() + "\n"
        + "Technical Focus: " + request.getTechnicalFocus() + "\n\n"

        + "Candidate Resume:\n"
        + resumeText
        + "\n\n"

        + "This is a virtual interview conducted by a professional human interviewer.\n\n"

        + "IMPORTANT CONVERSATION RULES:\n"
        + "1. Speak naturally and professionally.\n"
        + "2. Give ONLY ONE conversational turn at a time.\n"
        + "3. NEVER ask multiple questions in one response.\n"
        + "4. NEVER combine a greeting with a question.\n"
        + "5. NEVER ask two questions together.\n"
        + "6. Keep each response short and natural.\n"
        + "7. Wait for the candidate's answer before continuing.\n"
        + "8. Do not provide explanations unless naturally appropriate.\n"
        + "9. Do not mention that you are an AI.\n"
        + "10. Do not say 'Please have a seat' because this is a virtual interview.\n\n"

        + "This is the FIRST interviewer turn.\n"
        + "The first turn must ONLY be a short professional greeting.\n"
        + "Do NOT ask how the candidate is doing yet.\n"
        + "Do NOT ask the candidate to introduce themselves yet.\n"
        + "Do NOT ask about the resume yet.\n"
        + "Do NOT ask a technical question yet.\n\n"

        + "Example style:\n"
        + "\"Good morning. It's nice to meet you.\"\n\n"

        + "Return ONLY what the interviewer should say.";

        String firstQuestion =
                geminiService.generateQuestion(
                        prompt
                );

        // =====================================================
        // SEND RESPONSE TO FRONTEND
        // =====================================================

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

                "Interview created successfully",

                firstQuestion
        );
    }


    // =========================================================
    // PROCESS CANDIDATE ANSWER
    // =========================================================

    public String processAnswer(
            String email,
            AnswerRequest request
    ) {

        // =====================================================
        // FIND LOGGED-IN USER
        // =====================================================

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        // =====================================================
        // VALIDATE INTERVIEW ID
        // =====================================================

        if (request.getInterviewId() == null) {

            throw new RuntimeException(
                    "Interview ID is required"
            );
        }

        // =====================================================
        // VALIDATE USER ANSWER
        // =====================================================

        if (
                request.getUserAnswer() == null
                || request.getUserAnswer()
                        .trim()
                        .isEmpty()
        ) {

            throw new RuntimeException(
                    "Answer cannot be empty"
            );
        }

        // =====================================================
        // FIND INTERVIEW
        // =====================================================

        Interview interview =
                interviewRepository.findById(
                        request.getInterviewId()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Interview not found"
                        )
                );

        // =====================================================
        // SECURITY CHECK
        // =====================================================

        if (
                interview.getUser() == null
                || !interview
                        .getUser()
                        .getId()
                        .equals(user.getId())
        ) {

            throw new RuntimeException(
                    "You are not authorised to access this interview"
            );
        }

        // =====================================================
        // BUILD GEMINI PROMPT
        // =====================================================

        String prompt =
        "You are conducting a realistic professional virtual interview.\n\n"

        + "Interview Type: "
        + interview.getInterviewType().name()
        + "\n"

        + "Target Role: "
        + interview.getTargetRole()
        + "\n"

        + "Difficulty: "
        + interview.getDifficulty().name()
        + "\n"

        + "Technical Focus: "
        + interview.getTechnicalFocus()
        + "\n\n"

        + "Candidate Resume:\n"
        + interview.getResumeText()
        + "\n\n"

        + "Previous Interviewer Question:\n"
        + request.getCurrentQuestion()
        + "\n\n"

        + "Candidate's Answer:\n"
        + request.getUserAnswer()
        + "\n\n"

        + "Now continue the interview naturally based on the candidate's answer.\n\n"

        + "CRITICAL CONVERSATION RULES:\n"
        + "1. Your response must contain ONLY ONE interviewer turn.\n"
        + "2. Ask AT MOST ONE question.\n"
        + "3. NEVER ask two questions in the same response.\n"
        + "4. NEVER give a list of questions.\n"
        + "5. NEVER combine multiple questions using 'and'.\n"
        + "6. Do not immediately ask another question after asking one.\n"
        + "7. Keep the response concise and conversational.\n"
        + "8. Do not answer your own question.\n"
        + "9. Do not mention that you are an AI.\n"
        + "10. Speak like a professional human interviewer.\n\n"

        + "INTERVIEW PROGRESSION:\n"
        + "Move through the interview naturally rather than jumping directly into technical questions.\n\n"

        + "Stage 1 - Conversation:\n"
        + "After the initial greeting, ask the candidate how they are doing.\n\n"

        + "Stage 2 - Introduction:\n"
        + "After the candidate responds naturally, ask them to tell you about themselves.\n\n"

        + "Stage 3 - Resume and Experience:\n"
        + "Use the candidate's resume to identify relevant projects, skills, education, internships, "
        + "certifications, or experience.\n"
        + "Ask about ONE relevant item at a time.\n"
        + "When the candidate mentions a project, ask natural follow-up questions about that project.\n"
        + "For example, ask about their role, decisions they made, challenges they faced, or technologies they used.\n\n"

        + "Stage 4 - Technical Interview:\n"
        + "After the introduction and relevant resume/project discussion, gradually transition into technical questions.\n"
        + "Ask technical questions one at a time.\n"
        + "For a Java role, questions may cover Java, OOP, collections, exception handling, "
        + "multithreading, databases, problem solving, or other relevant topics.\n"
        + "Use the selected difficulty level when choosing questions.\n\n"

        + "Stage 5 - Coding / Problem Solving:\n"
        + "When appropriate, give ONE coding or problem-solving question at a time.\n"
        + "Ask the candidate to explain their approach before writing code when appropriate.\n\n"

        + "Stage 6 - Closing:\n"
        + "Near the end of the interview, ask whether the candidate has any questions for the interviewer.\n"
        + "After that, close the interview professionally.\n\n"

        + "IMPORTANT:\n"
        + "Use the candidate's resume when it is relevant.\n"
        + "Do not invent projects, skills, companies, experience, or qualifications that are not present in the resume.\n"
        + "Do not ask several questions at once.\n"
        + "Return ONLY what the interviewer should say to the candidate.";

        // =====================================================
        // ASK GEMINI FOR NEXT RESPONSE
        // =====================================================

        return geminiService.generateQuestion(
                prompt
        );
    }
}