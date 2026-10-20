package com.prep.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.prep.backend.dto.AnswerRequest;
import com.prep.backend.dto.AnswerResponse;
import com.prep.backend.dto.InterviewResultResponse;
import com.prep.backend.dto.NextQuestionRequest;
import com.prep.backend.dto.NextQuestionResponse;
import com.prep.backend.dto.StartInterviewRequest;
import com.prep.backend.dto.StartInterviewResponse;
import com.prep.backend.service.GeminiService;
import com.prep.backend.service.InterviewService;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final GeminiService geminiService;

    public InterviewController(
            InterviewService interviewService,
            GeminiService geminiService
    ) {
        this.interviewService = interviewService;
        this.geminiService = geminiService;
    }


    // =========================================================
    // START INTERVIEW
    // =========================================================

    @PostMapping(
            value = "/start",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<StartInterviewResponse> startInterview(
            Authentication authentication,

            @RequestPart("data")
            StartInterviewRequest request,

            @RequestPart("resume")
            MultipartFile resume
    ) {

        String email = authentication.getName();

        StartInterviewResponse response =
                interviewService.startInterview(
                        email,
                        request,
                        resume
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // PROCESS CANDIDATE ANSWER
    // =========================================================

    @PostMapping(
            value = "/answer",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AnswerResponse> processAnswer(
            Authentication authentication,

            @RequestBody
            AnswerRequest request
    ) {

        String email = authentication.getName();

        AnswerResponse response =
                interviewService.processAnswer(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GENERATE NEXT QUESTION
    // =========================================================

    @PostMapping(
            value = "/next-question",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<NextQuestionResponse> generateNextQuestion(
            Authentication authentication,

            @RequestBody
            NextQuestionRequest request
    ) {

        String email = authentication.getName();

        NextQuestionResponse response =
                interviewService.generateNextQuestion(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET INTERVIEW RESULTS
    // =========================================================

    @GetMapping("/{interviewId}/results")
    public ResponseEntity<InterviewResultResponse> getInterviewResults(
            Authentication authentication,

            @PathVariable Long interviewId
    ) {

        String email = authentication.getName();

        InterviewResultResponse response =
                interviewService.getInterviewResults(
                        email,
                        interviewId
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // RESUME UNFINISHED INTERVIEW
    // =========================================================

    @GetMapping("/{interviewId}/resume")
    public ResponseEntity<java.util.Map<String, Object>> resumeInterview(
            Authentication authentication,

            @PathVariable Long interviewId
    ) {

        String email = authentication.getName();

        java.util.Map<String, Object> response =
                interviewService.resumeInterview(
                        email,
                        interviewId
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DISCARD UNFINISHED INTERVIEW
    // =========================================================

    @org.springframework.web.bind.annotation.DeleteMapping("/{interviewId}")
    public ResponseEntity<com.prep.backend.dto.MessageResponse> discardInterview(
            Authentication authentication,

            @PathVariable Long interviewId
    ) {

        String email = authentication.getName();

        com.prep.backend.dto.MessageResponse response =
                interviewService.discardInterview(
                        email,
                        interviewId
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // SYNTHESIZE MAYA SPEECH (CONSISTENT CLOUD TTS)
    // =========================================================

    @PostMapping(value = "/tts", produces = "audio/wav")
    public ResponseEntity<byte[]> synthesizeMayaSpeech(
            @RequestBody java.util.Map<String, String> request
    ) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] wavAudio = geminiService.synthesizeSpeech(text.trim());

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "audio/wav")
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(wavAudio);
        } catch (Exception ex) {
            System.err.println("Cloud TTS unavailable: " + ex.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}