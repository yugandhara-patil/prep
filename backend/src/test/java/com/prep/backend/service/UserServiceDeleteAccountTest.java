package com.prep.backend.service;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
    void testDeleteAccountSuccessDeletesUserAndAssociatedInterviews() {
        User user = new User();
        user.setId(42L);
        user.setEmail("candidate@example.com");

        when(userRepository.findByEmail("candidate@example.com")).thenReturn(Optional.of(user));

        Interview interview1 = new Interview();
        Interview interview2 = new Interview();
        when(interviewRepository.findByUserOrderByStartedAtDesc(user)).thenReturn(List.of(interview1, interview2));

        InterviewAnswer answer1 = new InterviewAnswer();
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview1)).thenReturn(List.of(answer1));
        when(interviewAnswerRepository.findByInterviewOrderByIdAsc(interview2)).thenReturn(List.of());

        MessageResponse response = userService.deleteAccount("candidate@example.com");

        assertNotNull(response);
        assertEquals("Account deleted successfully.", response.getMessage());

        verify(interviewAnswerRepository).deleteAll(List.of(answer1));
        verify(interviewRepository).deleteAll(List.of(interview1, interview2));
        verify(userRepository).delete(user);
    }

    @Test
    void testDeleteAccountWhenUserNotFoundThrowsNotFound() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.deleteAccount("nonexistent@example.com")
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(userRepository, never()).delete(any());
        verify(interviewRepository, never()).deleteAll(any());
    }

    @Test
    void testDeleteAccountCaseInsensitiveEmail() {
        User user = new User();
        user.setId(10L);
        user.setEmail("user@example.com");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(interviewRepository.findByUserOrderByStartedAtDesc(user)).thenReturn(List.of());

        MessageResponse response = userService.deleteAccount("  USER@EXAMPLE.COM  ");

        assertEquals("Account deleted successfully.", response.getMessage());
        verify(userRepository).delete(user);
    }
}
