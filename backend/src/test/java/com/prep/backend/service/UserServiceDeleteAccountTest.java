package com.prep.backend.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.prep.backend.dto.MessageResponse;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;
import com.prep.backend.repository.UserRepository;
import com.prep.backend.security.JwtService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceDeleteAccountTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private InterviewAnswerRepository interviewAnswerRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                passwordEncoder,
                jwtService,
                emailService,
                interviewRepository,
                interviewAnswerRepository
        );
    }

    @Test
    void testRequestAccountDeletionWhenSmtpNotConfiguredThrows503() {
        User user = new User();
        user.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(emailService.isMailConfigured()).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.requestAccountDeletion("test@example.com")
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRequestAccountDeletionSuccessGeneratesTokenAndSendsEmail() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(emailService.isMailConfigured()).thenReturn(true);

        MessageResponse response = userService.requestAccountDeletion("test@example.com");

        assertNotNull(response);
        assertTrue(response.getMessage().contains("Verification email sent"));
        assertNotNull(user.getDeleteAccountToken());
        assertNotNull(user.getDeleteAccountCode());
        assertEquals(6, user.getDeleteAccountCode().length());
        assertTrue(user.getDeleteAccountTokenExpiry().isAfter(LocalDateTime.now()));

        verify(userRepository).save(user);
        verify(emailService).sendAccountDeletionVerificationEmail(
                eq("test@example.com"),
                eq("Test User"),
                contains("token=" + user.getDeleteAccountToken()),
                eq(user.getDeleteAccountCode())
        );
    }

    @Test
    void testRequestAccountDeletionWhenSmtpAuthenticationFailsThrows502() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setFullName("Test User");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(emailService.isMailConfigured()).thenReturn(true);
        doThrow(new org.springframework.mail.MailAuthenticationException("Authentication failed"))
                .when(emailService)
                .sendAccountDeletionVerificationEmail(any(), any(), any(), any());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.requestAccountDeletion("test@example.com")
        );

        assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
        assertTrue(ex.getReason().contains("SMTP authentication failed"));
    }

    @Test
    void testConfirmAccountDeletionSuccessDeletesUserAndInterviews() {
        User user = new User();
        user.setId(10L);
        user.setEmail("delete-me@example.com");
        user.setDeleteAccountToken("valid-token-123");
        user.setDeleteAccountCode("654321");
        user.setDeleteAccountTokenExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByDeleteAccountToken("valid-token-123")).thenReturn(Optional.of(user));

        Interview interview = new Interview();
        when(interviewRepository.findByUserOrderByStartedAtDesc(user)).thenReturn(List.of(interview));
        InterviewAnswer answer = new InterviewAnswer();
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview)).thenReturn(List.of(answer));

        MessageResponse response = userService.confirmAccountDeletion("valid-token-123");

        assertEquals("Account deleted successfully.", response.getMessage());
        verify(interviewAnswerRepository).deleteAll(List.of(answer));
        verify(interviewRepository).deleteAll(List.of(interview));
        verify(userRepository).delete(user);
    }

    @Test
    void testConfirmAccountDeletionExpiredThrowsBadRequest() {
        User user = new User();
        user.setEmail("expired@example.com");
        user.setDeleteAccountToken("expired-token");
        user.setDeleteAccountTokenExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByDeleteAccountToken("expired-token")).thenReturn(Optional.of(user));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.confirmAccountDeletion("expired-token")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("expired"));
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testConfirmAccountDeletionInvalidCodeThrowsBadRequest() {
        when(userRepository.findByDeleteAccountToken("bad-code")).thenReturn(Optional.empty());
        when(userRepository.findByDeleteAccountCode("bad-code")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.confirmAccountDeletion("bad-code")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testCancelAccountDeletionClearsTokensWithoutDeletingUser() {
        User user = new User();
        user.setEmail("cancel@example.com");
        user.setDeleteAccountToken("token-to-clear");
        user.setDeleteAccountCode("123456");
        user.setDeleteAccountTokenExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByEmail("cancel@example.com")).thenReturn(Optional.of(user));

        MessageResponse response = userService.cancelAccountDeletion("cancel@example.com");

        assertEquals("Account deletion cancelled.", response.getMessage());
        assertNull(user.getDeleteAccountToken());
        assertNull(user.getDeleteAccountCode());
        assertNull(user.getDeleteAccountTokenExpiry());
        verify(userRepository).save(user);
        verify(userRepository, never()).delete(any());
    }

    @Test
    void testConfirmAccountDeletionForEmailWithMismatchedCodeThrowsBadRequest() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setDeleteAccountCode("111222");
        user.setDeleteAccountTokenExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.confirmAccountDeletionForEmail("user@example.com", "999999")
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Invalid deletion verification"));
        verify(userRepository, never()).delete(any());
    }
}
