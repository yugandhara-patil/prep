package com.prep.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prep.backend.dto.AnswerRequest;
import com.prep.backend.dto.AnswerResponse;
import com.prep.backend.dto.StartInterviewRequest;
import com.prep.backend.dto.StartInterviewResponse;
import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewStatus;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.dto.NextQuestionRequest;
import com.prep.backend.dto.NextQuestionResponse;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final ResumeTextExtractorService resumeTextExtractorService;
    private final GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

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

        String prompt;

        if (interviewType == InterviewType.HR) {

            prompt =
                    "You are conducting a realistic professional HR virtual interview.\n\n"

                    + "Target Role: "
                    + request.getTargetRole()
                    + "\n"

                    + "Difficulty: "
                    + request.getDifficulty()
                    + "\n\n"

                    + "Candidate Resume:\n"
                    + resumeText
                    + "\n\n"

                    + "This is a virtual interview conducted by a professional human interviewer.\n\n"

                    + "IMPORTANT CONVERSATION RULES:\n"
                    + "1. Speak naturally and professionally.\n"
                    + "2. Give ONLY ONE conversational turn at a time.\n"
                    + "3. NEVER ask multiple questions in one response.\n"
                    + "4. NEVER combine a greeting with a question.\n"
                    + "5. Keep each response short and natural.\n"
                    + "6. Wait for the candidate's answer before continuing.\n"
                    + "7. Do not mention that you are an AI.\n"
                    + "8. Do not say 'Please have a seat' because this is a virtual interview.\n\n"

                    + "This is the FIRST interviewer turn.\n"
                    + "The first turn must ONLY be a short professional greeting.\n"
                    + "Do NOT ask how the candidate is doing yet.\n"
                    + "Do NOT ask for an introduction yet.\n\n"

                    + "Example style:\n"
                    + "\"Good morning. It's nice to meet you.\"\n\n"

                    + "Return ONLY what the interviewer should say.";

        } else {

            prompt =
                    "You are conducting a realistic professional technical virtual interview.\n\n"

                    + "Target Role: "
                    + request.getTargetRole()
                    + "\n"

                    + "Difficulty: "
                    + request.getDifficulty()
                    + "\n"

                    + "Technical Focus: "
                    + request.getTechnicalFocus()
                    + "\n\n"

                    + "Candidate Resume:\n"
                    + resumeText
                    + "\n\n"

                    + "This is a virtual interview conducted by a professional human interviewer.\n\n"

                    + "IMPORTANT CONVERSATION RULES:\n"
                    + "1. Speak naturally and professionally.\n"
                    + "2. Give ONLY ONE conversational turn at a time.\n"
                    + "3. NEVER ask multiple questions in one response.\n"
                    + "4. NEVER combine a greeting with a question.\n"
                    + "5. Keep each response short and natural.\n"
                    + "6. Wait for the candidate's answer before continuing.\n"
                    + "7. Do not mention that you are an AI.\n"
                    + "8. Do not say 'Please have a seat' because this is a virtual interview.\n\n"

                    + "This is the FIRST interviewer turn.\n"
                    + "The first turn must ONLY be a short professional greeting.\n"
                    + "Do NOT ask how the candidate is doing yet.\n"
                    + "Do NOT ask for an introduction yet.\n"
                    + "Do NOT ask about the resume yet.\n"
                    + "Do NOT ask a technical question yet.\n\n"

                    + "Example style:\n"
                    + "\"Good morning. It's nice to meet you.\"\n\n"

                    + "Return ONLY what the interviewer should say.";
        }

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

  public AnswerResponse processAnswer(
        String email,
        AnswerRequest request
) {

    // =========================================================
    // FIND LOGGED-IN USER
    // =========================================================

    User user = userRepository.findByEmail(email)
            .orElseThrow(
                    () -> new RuntimeException("User not found")
            );

    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    if (request.getInterviewId() == null) {
        throw new RuntimeException("Interview ID is required");
    }

    if (
            request.getUserAnswer() == null
                    || request.getUserAnswer().trim().isEmpty()
    ) {
        throw new RuntimeException("Answer cannot be empty");
    }

    if (
            request.getCurrentQuestion() == null
                    || request.getCurrentQuestion().trim().isEmpty()
    ) {
        throw new RuntimeException("Current question is required");
    }

    // =========================================================
    // FIND INTERVIEW
    // =========================================================

    Interview interview =
            interviewRepository.findById(
                    request.getInterviewId()
            )
            .orElseThrow(
                    () -> new RuntimeException(
                            "Interview not found"
                    )
            );

    // =========================================================
    // SECURITY CHECK
    // =========================================================

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

    // =========================================================
    // SMALL RESUME CONTEXT
    // =========================================================

    String resumeText = interview.getResumeText();

    if (resumeText == null) {
        resumeText = "";
    }

    // Only use a small amount of resume context.
    // This keeps Gemini requests faster.
    if (resumeText.length() > 2500) {
        resumeText =
                resumeText.substring(0, 2500);
    }

    // =========================================================
    // FAST INTERVIEWER PROMPT
    // =========================================================

    String prompt;

    if (interview.getInterviewType() == InterviewType.HR) {

        prompt =
                "You are a professional human HR interviewer conducting a realistic virtual interview.\n\n"

                + "Target role: "
                + interview.getTargetRole()
                + "\n"

                + "Difficulty: "
                + interview.getDifficulty().name()
                + "\n\n"

                + "Candidate resume context:\n"
                + resumeText
                + "\n\n"

                + "Previous interviewer turn:\n"
                + request.getCurrentQuestion()
                + "\n\n"

                + "Candidate answer:\n"
                + request.getUserAnswer()
                + "\n\n"

                + "Your task is to continue a realistic HR interview.\n\n"

                + "HR interview progression:\n"
                + "1. After the opening greeting, ask how the candidate is doing.\n"
                + "2. Then ask the candidate to tell you about themselves.\n"
                + "3. Then ask about their background, motivation, or interest in the role.\n"
                + "4. Then ask resume/project-based behavioural questions.\n"
                + "5. Then ask behavioural questions about teamwork, challenges, conflict, leadership, failure, pressure, or problem solving.\n"
                + "6. Later ask role/company motivation and career questions.\n"
                + "7. Near the end, ask whether the candidate has any questions for the interviewer.\n"
                + "8. Do not jump to technical questions.\n\n"

                + "Use the previous interviewer turn to determine which stage comes next.\n"
                + "If the candidate gives an interesting answer, a natural follow-up may explore that answer before moving forward.\n\n"

                + "Evaluation rules:\n"
                + "- Evaluate communication, relevance, clarity, confidence, and behavioural reasoning.\n"
                + "- Do NOT mark a subjective HR opinion simply as incorrect.\n"
                + "- Use INCORRECT only when the response is clearly non-responsive, contradictory to the question, or contains a factual error that matters to the answer.\n"
                + "- If appropriate, give a very short spoken suggestion for improvement.\n\n"

                + "Conversation rules:\n"
                + "1. Ask exactly ONE next question.\n"
                + "2. Keep the next question concise and natural.\n"
                + "3. Do not ask multiple questions together.\n"
                + "4. Do not give a long evaluation.\n"
                + "5. Do not mention AI.\n"
                + "6. Speak like a professional human interviewer.\n\n"

                + "Return ONLY valid JSON in exactly this format:\n"
                + "{\n"
                + "  \"evaluation\": \"CORRECT | PARTIALLY_CORRECT | INCORRECT\",\n"
                + "  \"feedback\": \"very short spoken feedback or empty string\",\n"
                + "  \"nextQuestion\": \"one concise HR interviewer question\"\n"
                + "}";

    } else {

        prompt =
                "You are a professional human technical interviewer conducting a realistic virtual interview.\n\n"
                + "Interview type: TECHNICAL\n"
                + "Target role: " + interview.getTargetRole() + "\n"
                + "Difficulty: " + interview.getDifficulty().name() + "\n"
                + "Technical focus: " + interview.getTechnicalFocus() + "\n\n"
                + "Candidate resume context:\n" + resumeText + "\n\n"
                + "Previous question:\n" + request.getCurrentQuestion() + "\n\n"
                + "Candidate answer:\n" + request.getUserAnswer() + "\n\n"
                + "Evaluate the answer briefly and continue the technical interview.\n\n"
                + "Rules:\n"
                + "1. Ask exactly ONE next question.\n"
                + "2. Keep the next question concise.\n"
                + "3. If the answer is correct, do not give a long explanation.\n"
                + "4. If partially correct or incorrect, give ONE short spoken correction.\n"
                + "5. Respect the selected difficulty and technical focus.\n"
                + "6. Do not mention AI.\n"
                + "7. Speak like a professional human interviewer.\n\n"
                + "Return ONLY valid JSON in exactly this format:\n"
                + "{\n"
                + "  \"evaluation\": \"CORRECT | PARTIALLY_CORRECT | INCORRECT\",\n"
                + "  \"feedback\": \"very short spoken correction or empty string\",\n"
                + "  \"nextQuestion\": \"one concise technical interviewer question\"\n"
                + "}";
    }

    String jsonResponse =
            geminiService.generateInterviewResponse(
                    prompt
            );

    // =========================================================
    // CLEAN RESPONSE
    // =========================================================

    String cleanedResponse =
            jsonResponse
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

    // =========================================================
    // PARSE RESPONSE
    // =========================================================

    try {

        return objectMapper.readValue(
                cleanedResponse,
                AnswerResponse.class
        );

    } catch (Exception exception) {

        System.err.println(
                "❌ Failed to parse Gemini interview response:"
        );

        System.err.println(
                cleanedResponse
        );

        throw new RuntimeException(
                "Invalid response received from Gemini",
                exception
        );
    }
}
public NextQuestionResponse generateNextQuestion(
        String email,
        NextQuestionRequest request
) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(
                    () -> new RuntimeException("User not found")
            );

    if (request.getInterviewId() == null) {
        throw new RuntimeException("Interview ID is required");
    }

    Interview interview =
            interviewRepository.findById(
                    request.getInterviewId()
            )
            .orElseThrow(
                    () -> new RuntimeException("Interview not found")
            );

    if (
            interview.getUser() == null
                    || !interview.getUser().getId().equals(user.getId())
    ) {
        throw new RuntimeException(
                "You are not authorised to access this interview"
        );
    }

    String prompt;

    if (interview.getInterviewType() == InterviewType.HR) {

        prompt =
                "You are a professional human HR interviewer conducting a realistic virtual interview.\n\n"
                + "Target role: " + interview.getTargetRole() + "\n"
                + "Difficulty: " + interview.getDifficulty().name() + "\n\n"
                + "Candidate resume context:\n"
                + (interview.getResumeText() == null ? "" : interview.getResumeText().substring(0, Math.min(interview.getResumeText().length(), 2500)))
                + "\n\n"
                + "Previous interviewer question:\n"
                + request.getCurrentQuestion() + "\n\n"
                + "Generate the next HR interview question.\n\n"
                + "Progress naturally through these stages: greeting → wellbeing → tell me about yourself → background/motivation → resume/project behaviour → teamwork/challenges/conflict/leadership/pressure → career/company motivation → candidate questions.\n"
                + "Use the previous question to decide the next stage. Do not jump to technical questions.\n\n"
                + "Rules:\n"
                + "1. Ask exactly ONE question.\n"
                + "2. Keep it concise and natural.\n"
                + "3. Do not ask multiple questions together.\n"
                + "4. Do not mention AI.\n"
                + "5. Speak like a professional human interviewer.\n\n"
                + "Return ONLY the question text.";

    } else {

        prompt =
                "You are a professional human technical interviewer conducting a realistic virtual interview.\n\n"
                + "Target role: " + interview.getTargetRole() + "\n"
                + "Difficulty: " + interview.getDifficulty().name() + "\n"
                + "Technical focus: " + interview.getTechnicalFocus() + "\n\n"
                + "The previous interviewer question was:\n"
                + request.getCurrentQuestion() + "\n\n"
                + "Generate the next appropriate technical interview question.\n\n"
                + "Technical interview progression:\n"
                + "1. After the opening greeting, ask how the candidate is doing.\n"
                + "2. Then ask the candidate to tell you about themselves.\n"
                + "3. Then ask about a relevant project or experience from the resume.\n"
                + "4. Then ask about the candidate's specific contribution to that project.\n"
                + "5. Only after the conversational opening, move into technical questions related to the selected focus and resume.\n"
                + "6. Later include deeper technical questions and problem-solving/coding discussion appropriate to the selected difficulty.\n\n"
                + "Use the previous question to determine the next stage. Do not jump directly to a technical question after the opening greeting.\n\n"
                + "Rules:\n"
                + "1. Ask exactly ONE question.\n"
                + "2. Keep it concise and natural.\n"
                + "3. Respect the selected difficulty and technical focus.\n"
                + "4. Do not mention AI.\n"
                + "5. Do not ask multiple questions.\n"
                + "6. Speak like a professional human interviewer.\n\n"
                + "Return ONLY the question text.";
    }

    String nextQuestion =
            geminiService.generateQuestion(prompt);

    return new NextQuestionResponse(
            nextQuestion
    );
}
}