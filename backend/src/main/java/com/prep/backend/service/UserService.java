package com.prep.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.prep.backend.dto.LoginRequest;
import com.prep.backend.dto.LoginResponse;
import com.prep.backend.dto.ProfileRequest;
import com.prep.backend.dto.ProfileResponse;
import com.prep.backend.dto.RegisterRequest;
import com.prep.backend.entity.Role;
import com.prep.backend.entity.User;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.security.JwtService;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;


@Service

public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    @Value("${google.client-id}")
private String googleClientId;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailSender = mailSender;
    }

    public User registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invalid email or password"
                        )
                );

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                token,
                "Login successful",
                user.getProfilePhotoUrl()
        );
    }

    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getTargetRole(),
                user.getCurrentStatus(),
                user.getExperienceLevel(),
                user.getSkills(),
                user.getAbout(),
                user.getLinkedin(),
                user.getGithub(),
                user.getPortfolio(),
                user.getProfilePhotoUrl()
        );
    }

    public ProfileResponse updateProfile(
            String email,
            ProfileRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        user.setFullName(request.getFullName());
        user.setTargetRole(request.getTargetRole());
        user.setCurrentStatus(request.getCurrentStatus());
        user.setExperienceLevel(request.getExperienceLevel());
        user.setSkills(request.getSkills());
        user.setAbout(request.getAbout());
        user.setLinkedin(request.getLinkedin());
        user.setGithub(request.getGithub());
        user.setPortfolio(request.getPortfolio());
        user.setProfilePhotoUrl(
                request.getProfilePhotoUrl()
        );

        User updatedUser =
                userRepository.save(user);

        return new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getTargetRole(),
                updatedUser.getCurrentStatus(),
                updatedUser.getExperienceLevel(),
                updatedUser.getSkills(),
                updatedUser.getAbout(),
                updatedUser.getLinkedin(),
                updatedUser.getGithub(),
                updatedUser.getPortfolio(),
                updatedUser.getProfilePhotoUrl()
        );
    }

   
public LoginResponse loginWithGoogle(
        com.prep.backend.dto.GoogleAuthRequest request) {

    try {
        GoogleIdTokenVerifier verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        JacksonFactory.getDefaultInstance())
                        .setAudience(
                                java.util.Collections.singletonList(googleClientId))
                        .build();

        GoogleIdToken idToken = verifier.verify(request.getIdToken());

        if (idToken == null) {
            throw new RuntimeException("Invalid Google ID token.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new RuntimeException("Google email is not verified.");
        }

        String email = payload.getEmail().trim().toLowerCase();
        String fullName = (String) payload.get("name");
        String photoUrl = (String) payload.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(
                    fullName != null && !fullName.isBlank()
                            ? fullName : "Google User");
            newUser.setPassword(passwordEncoder.encode(
                    java.util.UUID.randomUUID().toString()));
            newUser.setRole(Role.USER);

            if (photoUrl != null && !photoUrl.isBlank()) {
                newUser.setProfilePhotoUrl(photoUrl);
            }

            return userRepository.save(newUser);
        });

        if ((user.getProfilePhotoUrl() == null
                || user.getProfilePhotoUrl().isBlank())
                && photoUrl != null && !photoUrl.isBlank()) {
            user.setProfilePhotoUrl(photoUrl);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                token,
                "Google authentication successful",
                user.getProfilePhotoUrl());

    
} catch (java.io.IOException | java.security.GeneralSecurityException e) {
    throw new RuntimeException(
            "Unable to verify Google sign-in.", e);
}

}


    public com.prep.backend.dto.MessageResponse forgotPassword(
            com.prep.backend.dto.ForgotPasswordRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(user -> {
            String token = java.util.UUID.randomUUID().toString();

            user.setResetPasswordToken(token);
            user.setResetPasswordTokenExpiry(
                    java.time.LocalDateTime.now().plusMinutes(15)
            );
            userRepository.save(user);

            String resetLink = frontendUrl.replaceAll("/+$", "")
                    + "/reset-password?token=" + token;

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                String sender = System.getenv("MAIL_USERNAME");
                if (sender != null && !sender.isBlank()) {
                    message.setFrom(sender);
                }
                message.setTo(user.getEmail());
                message.setSubject("Reset your Prep password");
                message.setText(
                        "Hello " + user.getFullName() + ",\n\n"
                        + "We received a request to reset your Prep password.\n\n"
                        + "Click the link below to choose a new password. "
                        + "This link expires in 15 minutes and can only be used once.\n\n"
                        + resetLink + "\n\n"
                        + "If you did not request this, you can ignore this email."
                );

                mailSender.send(message);
            } catch (Exception mailEx) {
                System.err.println("Notice: SMTP email delivery failed or unconfigured: " + mailEx.getMessage());
                System.out.println("Generated Reset Password link for " + user.getEmail() + ": " + resetLink);
            }
        });

        return new com.prep.backend.dto.MessageResponse(
                "If an account with this email exists, password reset instructions have been processed."
        );
    }

    public com.prep.backend.dto.MessageResponse resetPassword(com.prep.backend.dto.ResetPasswordRequest request) {
        String token = request.getToken().trim();

        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token."));

        if (user.getResetPasswordTokenExpiry() == null 
                || user.getResetPasswordTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return new com.prep.backend.dto.MessageResponse(
                "Password has been successfully reset. You can now login with your new password."
        );
    }

    public ProfileResponse updateProfilePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePhotoUrl(photoUrl);
        User updated = userRepository.save(user);

        return new ProfileResponse(
                updated.getId(),
                updated.getFullName(),
                updated.getEmail(),
                updated.getTargetRole(),
                updated.getCurrentStatus(),
                updated.getExperienceLevel(),
                updated.getSkills(),
                updated.getAbout(),
                updated.getLinkedin(),
                updated.getGithub(),
                updated.getPortfolio(),
                updated.getProfilePhotoUrl()
        );
    }
}