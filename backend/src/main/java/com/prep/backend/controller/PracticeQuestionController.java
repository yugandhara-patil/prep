package com.prep.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prep.backend.dto.PracticeQuestionRequest;
import com.prep.backend.dto.PracticeQuestionResponse;
import com.prep.backend.service.PracticeQuestionService;

@RestController
@RequestMapping("/api/practice")
public class PracticeQuestionController {

    private final PracticeQuestionService practiceQuestionService;

    public PracticeQuestionController(
            PracticeQuestionService practiceQuestionService
    ) {
        this.practiceQuestionService = practiceQuestionService;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<PracticeQuestionResponse>> generateQuestions(
            @RequestBody PracticeQuestionRequest request
    ) {

        List<PracticeQuestionResponse> questions =
                practiceQuestionService.generateQuestions(
                        request.getSection(),
                        request.getDifficulty()
                );

        return ResponseEntity.ok(questions);
    }
}