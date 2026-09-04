package com.prep.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prep.backend.dto.ProfileRequest;
import com.prep.backend.dto.ProfileResponse;
import com.prep.backend.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // GET logged-in user's profile
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        ProfileResponse profile =
                userService.getProfile(email);

        return ResponseEntity.ok(profile);
    }

    // UPDATE logged-in user's profile
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody ProfileRequest request
    ) {

        String email = authentication.getName();

        ProfileResponse updatedProfile =
                userService.updateProfile(
                        email,
                        request
                );

        return ResponseEntity.ok(updatedProfile);
    }
}