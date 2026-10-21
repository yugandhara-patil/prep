package com.prep.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.prep.backend.dto.ForgotPasswordRequest;
import com.prep.backend.dto.MessageResponse;
import com.prep.backend.dto.ResetPasswordRequest;
import com.prep.backend.entity.User;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.security.JwtService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceForgotPasswordTest {

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
    void testForgotPasswordWhenEmailServiceIsUnconfiguredThrowsServiceUnavailable() {
        when(emailService.isMailConfigured()).thenReturn(false);

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.forgotPassword(request)
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertTrue(ex.getReason().contains("SMTP email service is not configured"));
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    void testForgotPasswordWhenEmailServiceIsConfiguredSendsEmailSuccessfully() {
        when(emailService.isMailConfigured()).thenReturn(true);

        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setFullName("Test User");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");

        MessageResponse response = userService.forgotPassword(request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("instructions have been sent"));
        assertNotNull(user.getResetPasswordToken());
        assertNotNull(user.getResetPasswordTokenExpiry());
        verify(userRepository, times(1)).save(user);
        verify(emailService, times(1)).sendPasswordResetEmail(eq("user@example.com"), eq("Test User"), anyString());
    }

    @Test
    void testResetPasswordWithValidToken() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setResetPasswordToken("valid-token-123");
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByResetPasswordToken("valid-token-123")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewSecret123")).thenReturn("encoded-new-secret");

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("NewSecret123");

        MessageResponse response = userService.resetPassword(request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("successfully reset"));
        assertEquals("encoded-new-secret", user.getPassword());
        assertNull(user.getResetPasswordToken());
        assertNull(user.getResetPasswordTokenExpiry());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testResetPasswordWithExpiredTokenThrowsException() {
        User user = new User();
        user.setId(1L);
        user.setResetPasswordToken("expired-token-456");
        user.setResetPasswordTokenExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByResetPasswordToken("expired-token-456")).thenReturn(Optional.of(user));

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token-456");
        request.setNewPassword("NewSecret123");

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                userService.resetPassword(request)
        );

        assertTrue(ex.getMessage().contains("expired"));
        verify(userRepository, never()).save(any(User.class));
    }
}
