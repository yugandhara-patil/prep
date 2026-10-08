package com.prep.backend.service;



import java.util.List;



import org.springframework.stereotype.Service;



import com.fasterxml.jackson.databind.ObjectMapper;

import com.prep.backend.dto.AnswerRequest;

import com.prep.backend.dto.AnswerResponse;

import com.prep.backend.dto.NextQuestionRequest;

import com.prep.backend.dto.NextQuestionResponse;

import com.prep.backend.entity.Interview;

import com.prep.backend.entity.InterviewAnswer;

import com.prep.backend.entity.InterviewType;

import com.prep.backend.entity.User;

import com.prep.backend.repository.InterviewAnswerRepository;



@Service

public class InterviewQuestionService {



    private final GeminiService geminiService;

    private final InterviewAnswerRepository interviewAnswerRepository;

    private final InterviewFlowService interviewFlowService;

    private final InterviewEvaluationService interviewEvaluationService;

    private final ObjectMapper objectMapper = new ObjectMapper();



    public InterviewQuestionService(

            GeminiService geminiService,

            InterviewAnswerRepository interviewAnswerRepository,

            InterviewFlowService interviewFlowService,

            InterviewEvaluationService interviewEvaluationService

    ) {

        this.geminiService = geminiService;

        this.interviewAnswerRepository = interviewAnswerRepository;

        this.interviewFlowService = interviewFlowService;

        this.interviewEvaluationService = interviewEvaluationService;

    }



    /**

     * Generates the Gemini response used after a candidate submits an answer.

     * The response contains evaluation, feedback, scores and the next question.

     */

    public AnswerResponse generateInterviewResponse(

            Interview interview,

            User user,

            AnswerRequest request,

            String stage,

            String nextStage,

            List<InterviewAnswer> previousAnswers

    ) {

        String resumeText = interview.getResumeText();

        if (resumeText == null) {

            resumeText = "";

        }

        if (resumeText.length() > 12000) {

            resumeText = resumeText.substring(0, 12000);

        }



        String previousQuestions = buildPreviousQuestions(previousAnswers);

        String prompt = buildInterviewPrompt(

                interview,

                user,

                request,

                stage,

                nextStage,

                resumeText,

                previousQuestions

        );



       if ("START_PERMISSION".equals(stage)
        && "START_PERMISSION".equals(nextStage)) {

    prompt += "\nSPECIAL INSTRUCTION: The candidate said they are not ready to begin yet. Return this exact nextQuestion: Of course. Take your time. Let me know when you're ready. Do not ask another question.\n";

} else if ("START_PERMISSION".equals(nextStage)) {

    prompt += "\nSPECIAL INSTRUCTION: Return this exact nextQuestion: Great. Shall we begin?\n";
}else if ("CANDIDATE_QUESTIONS".equals(stage)

                && interviewEvaluationService.isNoCandidateQuestionAnswer(request.getUserAnswer())) {

            prompt += "\nSPECIAL INSTRUCTION: The candidate said they have no questions. Return ONLY a short professional closing. Do not ask another question or ask the candidate to repeat or confirm their answer. Do not say 'We appreciate you walking through your background and experience.'\n";

        } else if (interviewEvaluationService.isIDontKnowAnswer(request.getUserAnswer())) {

            prompt += "\nSPECIAL INSTRUCTION: The candidate said they do not know the answer. Set evaluation to INCORRECT. Feedback MUST begin with 'It is okay.' and then briefly give the correct answer. Do not shame the candidate. Do not include the next question in feedback.\n";

        } else if ("INTRODUCTION".equals(nextStage)) {

            prompt += "\nSPECIAL INSTRUCTION: Return this exact nextQuestion using the candidate name: So, "

                    + user.getFullName()

                    + ", could you please introduce yourself?\n";

        } else if ("CANDIDATE_QUESTIONS".equals(nextStage)) {

            prompt += "\nSPECIAL INSTRUCTION: Return this exact nextQuestion: Do you have any questions for me? Do not ask anything technical.\n";

        } else if ("CLOSING".equals(nextStage)) {

            prompt += "\nSPECIAL INSTRUCTION: Return a professional closing that thanks the candidate and says the team will update them regarding the next steps in the process. Do not ask a question.\n";

        }



        AnswerResponse answerResponse = parseResponse(

                geminiService.generateInterviewResponse(prompt)

        );



        // Opening stages are deterministic and must not be changed by Gemini.

        if ("WELLBEING".equals(nextStage)) {

            answerResponse.setNextQuestion("How are you doing today?");

} else if ("START_PERMISSION".equals(nextStage)) {    answerResponse.setNextQuestion(
            "Great. Shall we begin?"
    );
} else if ("INTRODUCTION".equals(nextStage)) {

            answerResponse.setNextQuestion(

                    "So, " + user.getFullName() + ", could you please introduce yourself?"

            );

        } else if ("CANDIDATE_QUESTIONS".equals(nextStage)) {

            answerResponse.setNextQuestion("Do you have any questions for me?");

        }



        if ("GREETING".equals(stage)

                || "WELLBEING".equals(stage)

                || "START_PERMISSION".equals(stage)

                || "INTRODUCTION".equals(stage)) {

            answerResponse.setEvaluation("CORRECT");

            answerResponse.setFeedback("");

        }



        answerResponse = ensureUniqueQuestion(

                answerResponse,

                prompt,

                interview,

                previousQuestions,

                previousAnswers,

                resumeText

        );



        answerResponse.setNextStage(nextStage);

        return answerResponse;

    }



    /**

     * Generates a standalone next-question response for the dedicated

     * /next-question flow used by the frontend.

     */

    public NextQuestionResponse generateNextQuestion(

            Interview interview,

            User user,

            NextQuestionRequest request

    ) {

        String currentQuestion = request.getCurrentQuestion() == null

                ? ""

                : request.getCurrentQuestion();



        String prompt;



        if (interview.getInterviewType() == InterviewType.HR) {

            prompt = "You are a professional human HR interviewer conducting a realistic virtual interview.\n\n"

                    + "Target role: " + interview.getTargetRole() + "\n"

                    + "Difficulty: " + interview.getDifficulty().name() + "\n\n"

                    + "Candidate resume context:\n"

                    + limitResume(interview.getResumeText(), 2500)

                    + "\n\n"

                    + "Previous interviewer question:\n" + currentQuestion + "\n\n"

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

            prompt = "You are a professional human technical interviewer conducting a realistic virtual interview.\n\n"

                    + "Target role: " + interview.getTargetRole() + "\n"

                    + "Difficulty: " + interview.getDifficulty().name() + "\n"

                    + "Technical focus: " + interview.getTechnicalFocus() + "\n\n"

                    + "Candidate resume context:\n" + limitResume(interview.getResumeText(), 12000) + "\n\n"

                    + "The previous interviewer question was:\n" + currentQuestion + "\n\n"

                    + "Generate the next appropriate technical interview question.\n\n"

                    + "Technical interview progression:\n"

                    + "1. Opening greeting: Hello + candidate name.\n"

                    + "2. Ask how the candidate is doing.\n"

                    + "3. Ask: Great. Shall we begin?\n"

                    + "4. Ask the candidate to introduce themselves.\n"

                    + "5. Ask exactly three questions about a project from the resume.\n"

                    + "6. Ask exactly six technical questions based primarily on the resume, with target role, technical focus, and difficulty guiding relevance and depth.\n"

                    + "7. Ask whether the candidate has any questions for the interviewer.\n"

                    + "8. Close by thanking the candidate and saying the team will update them regarding the next steps.\n"

                 + "9. Difficulty rules:\n"
+ "EASY: Test basic definitions, fundamentals, purpose, and straightforward usage.\n"
+ "MEDIUM: Make the questions noticeably harder than EASY. Test practical application, reasoning, comparisons, debugging, real-world scenarios, and choosing between different approaches. Ask the candidate to explain WHY, not only WHAT. Require the candidate to apply concepts to a realistic situation rather than simply define them.\n"
+ "HARD: Test advanced understanding through edge cases, trade-offs, architecture, system design, optimisation, advanced debugging, and complex problem-solving.\n"
+ "10. Difficulty changes the complexity and depth of the questions, NOT the number of questions. The interview must still contain exactly three project questions and exactly six technical questions.\n\n"

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



        return new NextQuestionResponse(geminiService.generateQuestion(prompt));

    }



    private String buildInterviewPrompt(

            Interview interview,

            User user,

            AnswerRequest request,

            String stage,

            String nextStage,

            String resumeText,

            String previousQuestions

    ) {

        if (interview.getInterviewType() == InterviewType.HR) {

            return "You are a professional human HR interviewer conducting a realistic virtual interview.\n\n"

                    + "Target role: " + interview.getTargetRole() + "\n"

                    + "Difficulty: " + interview.getDifficulty().name() + "\n"

                    + "Current conversation stage: " + stage + "\n"

                    + "The next conversation stage must be: " + nextStage + "\n\n"

                    + "Candidate resume context:\n" + resumeText + "\n\n"

                    + "Previous interviewer turn:\n" + request.getCurrentQuestion() + "\n\n"

                    + "ALL PREVIOUS INTERVIEWER QUESTIONS IN THIS INTERVIEW:\n" + previousQuestions + "\n"

                    + "Candidate answer:\n" + request.getUserAnswer() + "\n\n"

                    + "Continue the interview naturally from the CURRENT stage.\n\n"

                    + "HR STAGE RULES:\n"

                    + "- GREETING: the greeting has already happened. Move to WELLBEING.\n"

                    + "- WELLBEING: acknowledge the candidate briefly and move to INTRODUCTION.\n"

                    + "- INTRODUCTION: move to BACKGROUND.\n"

                    + "- BACKGROUND: move to HR_BEHAVIOURAL.\n"

                    + "- HR_BEHAVIOURAL: ask relevant behavioural or resume-based follow-ups.\n"

                    + "- CANDIDATE_QUESTIONS: ask whether the candidate has any questions for the interviewer.\n"

                    + "- CLOSING: politely close the interview.\n\n"

                    + "Conversation rules:\n"

                    + "1. Ask exactly ONE next question.\n"

                    + "2. Keep the question concise and natural.\n"

                    + "3. Acknowledge the answer briefly when appropriate.\n"

                    + "4. Do not mention AI.\n"

                    + "5. Speak like a professional human interviewer.\n\n"

                    + "Evaluation rules:\n"

                    + "- CORRECT: the answer is relevant, clear, and substantially appropriate.\n"

                    + "- PARTIALLY_CORRECT: the answer has useful content but noticeable gaps.\n"

                    + "- INCORRECT: the response is clearly non-responsive, contradictory, or materially wrong.\n"

                    + "- Score each applicable category from 0 to 100.\n"

                    + "- communicationScore measures clarity, confidence, structure, and professional communication.\n"

                    + "- technicalKnowledgeScore is null for HR answers where technical knowledge is not applicable.\n"

                    + "- projectKnowledgeScore is null where project knowledge is not applicable.\n"

                    + "- responseQualityScore measures relevance, completeness, reasoning, and directness.\n\n"

                    + "Return ONLY valid JSON in exactly this format:\n"

                    + "{\n"

                    + "  \"evaluation\": \"CORRECT | PARTIALLY_CORRECT | INCORRECT\",\n"

                    + "  \"feedback\": \"very short spoken feedback or empty string\",\n"

                    + "  \"nextQuestion\": \"one concise HR interviewer question\",\n"

                    + "  \"communicationScore\": 0,\n"

                    + "  \"technicalKnowledgeScore\": null,\n"

                    + "  \"projectKnowledgeScore\": null,\n"

                    + "  \"responseQualityScore\": 0\n"

                    + "}";

        }



        return "You are a professional human technical interviewer conducting a realistic virtual interview.\n\n"

                + "Interview type: TECHNICAL\n"

                + "Candidate name: " + user.getFullName() + "\n"

                + "Target role: " + interview.getTargetRole() + "\n"

                + "Difficulty: " + interview.getDifficulty().name() + "\n"

                + "Technical focus preference: " + interview.getTechnicalFocus() + "\n"

                + "Important: technical focus is only a secondary preference and must NOT restrict questions to one technology.\n\n"

                + "Candidate resume context:\n" + resumeText + "\n\n"

                + "Current conversation stage: " + stage + "\n"

                + "The next conversation stage must be: " + nextStage + "\n\n"

                + "Previous interviewer turn:\n" + request.getCurrentQuestion() + "\n\n"

                + "ALL PREVIOUS INTERVIEWER QUESTIONS IN THIS INTERVIEW:\n" + previousQuestions + "\n"

                + "Candidate answer:\n" + request.getUserAnswer() + "\n\n"

                + "FOLLOW THIS EXACT TECHNICAL INTERVIEW FLOW:\n"

                + "1. GREETING: fixed greeting has already happened.\n"

                + "2. WELLBEING: ask exactly: How are you doing today?\n"

                + "3. START_PERMISSION: ask exactly: Great. Shall we begin?\n"

                + "4. INTRODUCTION: ask exactly: So, [candidate name], could you please introduce yourself?\n"

                + "5. PROJECT_1: ask the candidate to explain the project from the resume.\n"

                + "6. PROJECT_2: ask about the candidate's specific contribution.\n"

                + "7. PROJECT_3: ask about the most challenging part and how it was solved.\n"

                + "8. TECHNICAL_1 through TECHNICAL_6: ask exactly six technical questions total.\n"

                + "9. CANDIDATE_QUESTIONS: ask whether the candidate has any questions.\n"

                + "10. CLOSING: thank the candidate and say the team will update them regarding next steps.\n\n"

                + "PROJECT RULES:\n"

                + "- Ask exactly 3 project questions.\n"

                + "- The PROJECT stages must discuss an actual PROJECT from the candidate's resume, not an internship, job, training, certification, or work experience.\n"

                + "- If the resume contains a project named TechFolyo or TechFoliyo, use that project for PROJECT_1, PROJECT_2, and PROJECT_3.\n"

                + "- PROJECT_1 must ask only for a general explanation of that same project.\n"

                + "- PROJECT_2 must ask only about the candidate's specific contribution to that same project.\n"

                + "- PROJECT_3 must ask only about the most challenging part of that same project and how the candidate solved it.\n"

                + "- Do not use an internship as the project discussion when an actual project is present in the resume.\n"

                + "- Use only actual project details from the resume.\n"

                + "- Never invent project technologies or details.\n\n"

                + "ONE-QUESTION ENFORCEMENT:\n"

                + "- Return exactly ONE question in nextQuestion.\n"

                + "- Never ask a second question in the same response.\n"

                + "- Do not combine questions using 'and', 'also', 'what about', or multiple question marks.\n"

                + "- Ask one question, wait for the candidate's answer, then continue to the next stage.\n\n"

                + "TECHNICAL RULES:\n"

                + "- Ask exactly SIX technical questions. Never ask a seventh.\n"

                + "- The RESUME is the PRIMARY source for selecting technical topics.\n"

                + "- Identify technologies, programming languages, frameworks, databases, APIs, tools, and AI/ML concepts explicitly present in the resume.\n"

                + "- Before generating the six questions, mentally build a pool of the candidate's distinct technical areas from the resume.\n"

                + "- Select six different areas from that pool whenever at least six relevant areas are available.\n"

                + "- If fewer than six distinct areas are available, use the strongest remaining areas but do not repeat a topic until all available areas have been used.\n"

                + "- Target role is used for relevance only; it must NOT cause all questions to stay within generic Full Stack topics.\n"

                + "- Spring Boot, Java, Python, React, JavaScript, databases, REST APIs, AI/ML, Gemini/API integrations, cloud, DevOps, and other resume technologies are equally eligible when actually present.\n"

                + "- Distribute the six questions across different technologies or technical areas when enough areas are available.\n"

                + "- Do NOT focus only on the target role, technical focus, or Java. These are relevance guidance, not restrictions.\n"

                + "- If Java, Python, MySQL, React, JavaScript, Spring Boot, APIs, AI/ML, or other technologies appear in the resume, consider them as possible topics.\n"

                + "- Prefer a different technology or technical area for each question.\n"

                + "- NEVER repeat a question already asked in this interview.\n"

                + "- NEVER repeat a technical topic when another relevant resume technology is available.\n"

                + "- Compare every new question against ALL PREVIOUS INTERVIEWER QUESTIONS before returning it.\n"

                + "- Use only technologies and concepts actually supported by the resume.\n"

                + "- EASY: fundamentals and straightforward questions.\n"

                + "- MEDIUM: application, comparisons, practical scenarios, moderate debugging/problem-solving.\n"

                + "- HARD: deeper concepts, edge cases, trade-offs, architecture/design reasoning, advanced debugging/problem-solving.\n"

                + "- Difficulty changes complexity, not the number of questions.\n\n"

                + "CORRECTION RULE:\n"

                + "- If evaluation is INCORRECT, feedback MUST begin with 'Your answer is incorrect.' and then give the correct point briefly.\n"

                + "- If evaluation is PARTIALLY_CORRECT, feedback MUST begin with 'Your answer is partially correct.' and then state the missing or incorrect point briefly.\n"

                + "- Maximum 25 words for the entire feedback.\n"

                + "- Do not give a detailed explanation.\n"

                + "- Do not include the next question in feedback.\n"

                + "- Do not say 'let's move on', 'now', or any transition to the next question.\n"

                + "- If evaluation is CORRECT, feedback must be empty.\n\n"

                + "EVALUATION RULES:\n"

                + "- CORRECT: substantially correct and relevant.\n"

                + "- PARTIALLY_CORRECT: shows understanding but has important gaps.\n"

                + "- INCORRECT: clearly wrong, non-responsive, or materially inaccurate.\n"

                + "- Score each applicable category from 0 to 100.\n"

                + "- communicationScore measures clarity, confidence, structure, and professional communication.\n"

                + "- technicalKnowledgeScore measures technical understanding. Return null when not applicable.\n"

                + "- projectKnowledgeScore measures project understanding. Use it for PROJECT_1, PROJECT_2, PROJECT_3; otherwise return null.\n"

                + "- responseQualityScore measures relevance, completeness, reasoning, and directness.\n\n"

                + "Return ONLY valid JSON in exactly this format:\n"

                + "{\n"

                + "  \"evaluation\": \"CORRECT | PARTIALLY_CORRECT | INCORRECT\",\n"

                + "  \"feedback\": \"For INCORRECT: 'Your answer is incorrect.' plus a short correction. For PARTIALLY_CORRECT: 'Your answer is partially correct.' plus the missing point. For CORRECT: empty string.\",\n"

                + "  \"nextQuestion\": \"one concise interviewer response\",\n"

                + "  \"communicationScore\": 0,\n"

                + "  \"technicalKnowledgeScore\": 0,\n"

                + "  \"projectKnowledgeScore\": null,\n"

                + "  \"responseQualityScore\": 0\n"

                + "}";

    }



    private AnswerResponse ensureUniqueQuestion(

            AnswerResponse answerResponse,

            String prompt,

            Interview interview,

            String previousQuestions,

            List<InterviewAnswer> previousAnswers,

            String resumeText

    ) {

        int retryCount = 0;

        final int maxRetries = 5;



        while (isRepeatedQuestion(answerResponse.getNextQuestion(), previousAnswers)

                && retryCount < maxRetries) {

            retryCount++;

            String retryPrompt = prompt

                    + "\n\nCRITICAL DUPLICATE CHECK:\n"

                    + "The question you generated is already present in ALL PREVIOUS INTERVIEWER QUESTIONS. It MUST NOT be used again.\n"

                    + "Generate ONE completely different technical question.\n"

                    + "Use a different technical area or resume technology when possible.\n"

                    + "Do not rephrase the old question. Do not ask the same concept with different wording.\n"

                    + "Before returning JSON, compare your question against every previous question and reject it if it is the same question or same question intent.\n"

                    + "Previous questions:\n" + previousQuestions + "\n";



            answerResponse = parseResponse(

                    geminiService.generateInterviewResponse(retryPrompt)

            );

        }



        if (isRepeatedQuestion(answerResponse.getNextQuestion(), previousAnswers)) {

            String fallbackPrompt = "Generate ONE completely new technical interview question for the candidate.\n"

                    + "Target role: " + interview.getTargetRole() + "\n"

                    + "Difficulty: " + interview.getDifficulty().name() + "\n"

                    + "Resume:\n" + resumeText + "\n\n"

                    + "The following questions have ALREADY been asked and are forbidden. Do not repeat them or ask the same concept with different wording:\n"

                    + previousQuestions + "\n"

                    + "Return JSON only with fields evaluation, feedback, nextQuestion, nextStage, communicationScore, technicalKnowledgeScore.\n";



            answerResponse = parseResponse(

                    geminiService.generateInterviewResponse(fallbackPrompt)

            );

        }



        if (isRepeatedQuestion(answerResponse.getNextQuestion(), previousAnswers)) {

            answerResponse.setNextQuestion(

                    "Could you explain another technical concept from your resume that you have worked with?"

            );

        }



        return answerResponse;

    }



    private AnswerResponse parseResponse(String jsonResponse) {

        String cleaned = jsonResponse == null

                ? ""

                : jsonResponse

                        .replace("```json", "")

                        .replace("```", "")

                        .trim();



        try {

            return objectMapper.readValue(cleaned, AnswerResponse.class);

        } catch (Exception exception) {

            System.err.println("❌ Failed to parse Gemini interview response:");

            System.err.println(cleaned);

            throw new RuntimeException("Invalid response received from Gemini", exception);

        }

    }



    private String buildPreviousQuestions(List<InterviewAnswer> previousAnswers) {

        StringBuilder builder = new StringBuilder();

        if (previousAnswers != null) {

            for (InterviewAnswer previousAnswer : previousAnswers) {

                String question = previousAnswer.getQuestion();

                if (question != null && !question.trim().isEmpty()) {

                    builder.append("- ")

                            .append(question.trim())

                            .append("\n");

                }

            }

        }

        return builder.length() > 0 ? builder.toString() : "- None yet\n";

    }



    private boolean isRepeatedQuestion(

            String newQuestion,

            List<InterviewAnswer> previousAnswers

    ) {

        if (newQuestion == null || newQuestion.trim().isEmpty() || previousAnswers == null) {

            return false;

        }

        for (InterviewAnswer previousAnswer : previousAnswers) {

            String previousQuestion = previousAnswer.getQuestion();

            if (areQuestionsNearlyIdentical(newQuestion, previousQuestion)) {

                return true;

            }

        }

        return false;

    }



    private boolean areQuestionsNearlyIdentical(String first, String second) {

        if (first == null || second == null) return false;

        String a = normalizeQuestionForComparison(first);

        String b = normalizeQuestionForComparison(second);

        if (a.isEmpty() || b.isEmpty()) return false;

        if (a.equals(b)) return true;

        return a.contains(b) || b.contains(a);

    }



    private String normalizeQuestionForComparison(String question) {

        return question

                .toLowerCase()

                .replaceAll("[^a-z0-9\\s]", " ")

                .replaceAll("\\s+", " ")

                .trim();

    }



    private String limitResume(String resumeText, int maxLength) {

        if (resumeText == null) return "";

        return resumeText.substring(0, Math.min(resumeText.length(), maxLength));

    }

}
