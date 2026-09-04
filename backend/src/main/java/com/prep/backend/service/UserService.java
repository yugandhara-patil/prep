package com.prep.backend.service;

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

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
                "Login successful"
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
}