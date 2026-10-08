package com.prep.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prep.backend.entity.User;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.service.OverallPerformanceService;

@RestController
@RequestMapping("/api/interviews")
public class OverallPerformanceController {

    private final OverallPerformanceService overallPerformanceService;
    private final UserRepository userRepository;

    public OverallPerformanceController(
            OverallPerformanceService overallPerformanceService,
            UserRepository userRepository
    ) {
        this.overallPerformanceService = overallPerformanceService;
        this.userRepository = userRepository;
    }


    @GetMapping("/overall-performance")
    public ResponseEntity<Map<String, Object>> getOverallPerformance(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Map<String, Object> performance =
                overallPerformanceService.getOverallPerformance(user);

        return ResponseEntity.ok(performance);
    }
}