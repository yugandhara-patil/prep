package com.prep.backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.prep.backend.dto.RegisterRequest;
import com.prep.backend.entity.Role;
import com.prep.backend.entity.User;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.security.JwtService;

@ExtendWith(MockitoExtension.class)
class UserServiceRegisterTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, jwtService, emailService);
    }

    @Test
    void registerUser_success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Alice Wonderland");
        request.setEmail("Alice@Example.com");
        request.setPassword("Secret123!");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Secret123!")).thenReturn("hashed-pwd");

        User savedMockUser = new User();
        savedMockUser.setId(10L);
        savedMockUser.setEmail("alice@example.com");
        savedMockUser.setFullName("Alice Wonderland");
        savedMockUser.setRole(Role.USER);

        when(userRepository.save(any(User.class))).thenReturn(savedMockUser);

        User created = userService.registerUser(request);

        assertNotNull(created);
        assertEquals(10L, created.getId());
        assertEquals("alice@example.com", created.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_duplicateEmail_throwsResponseStatusExceptionConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Bob Builder");
        request.setEmail("bob@example.com");
        request.setPassword("Secret123!");

        User existingUser = new User();
        existingUser.setId(5L);
        existingUser.setEmail("bob@example.com");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(existingUser));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            userService.registerUser(request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void registerUser_dataIntegrityViolation_throwsResponseStatusExceptionConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Charlie Chaplin");
        request.setEmail("charlie@example.com");
        request.setPassword("Secret123!");

        when(userRepository.findByEmail("charlie@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Secret123!")).thenReturn("hashed-pwd");
        when(userRepository.save(any(User.class))).thenThrow(new DataIntegrityViolationException("Duplicate key error"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            userService.registerUser(request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }
}
