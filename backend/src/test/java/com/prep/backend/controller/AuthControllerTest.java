package com.prep.backend.controller;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.prep.backend.service.UserService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    private AuthController authController;

    private final String testClientId = "776270035755-test.apps.googleusercontent.com";

    @BeforeEach
    void setUp() {
        authController = new AuthController(userService);
    }

    @Test
    void getAuthConfig_returnsGoogleClientId() {
        when(userService.getGoogleClientId()).thenReturn(testClientId);

        ResponseEntity<Map<String, String>> response = authController.getAuthConfig();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testClientId, response.getBody().get("googleClientId"));
    }

    @Test
    void getGoogleClientId_returnsClientId() {
        when(userService.getGoogleClientId()).thenReturn(testClientId);

        ResponseEntity<Map<String, String>> response = authController.getGoogleClientId();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testClientId, response.getBody().get("clientId"));
    }

    @Test
    void register_success_returnsCreated() {
        com.prep.backend.dto.RegisterRequest request = new com.prep.backend.dto.RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        com.prep.backend.entity.User savedUser = new com.prep.backend.entity.User();
        savedUser.setId(1L);
        savedUser.setEmail("jane@example.com");

        when(userService.registerUser(request)).thenReturn(savedUser);

        ResponseEntity<com.prep.backend.entity.User> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(savedUser, response.getBody());
    }

    @Test
    void register_duplicateEmail_throwsResponseStatusException() {
        com.prep.backend.dto.RegisterRequest request = new com.prep.backend.dto.RegisterRequest();
        request.setFullName("Duplicate User");
        request.setEmail("duplicate@example.com");
        request.setPassword("password123");

        when(userService.registerUser(request)).thenThrow(
                new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email is already registered"
                )
        );

        org.springframework.web.server.ResponseStatusException ex =
                org.junit.jupiter.api.Assertions.assertThrows(
                        org.springframework.web.server.ResponseStatusException.class,
                        () -> authController.register(request)
                );

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void register_unexpectedException_bubblesUp() {
        com.prep.backend.dto.RegisterRequest request = new com.prep.backend.dto.RegisterRequest();
        request.setFullName("Error User");
        request.setEmail("error@example.com");
        request.setPassword("password123");

        when(userService.registerUser(request)).thenThrow(
                new RuntimeException("Database connection timeout")
        );

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> authController.register(request)
        );

        assertEquals("Database connection timeout", ex.getMessage());
    }

    @Test
    void handleResponseStatusException_returnsConflictStatusAndMessage() {
        org.springframework.web.server.ResponseStatusException ex =
                new org.springframework.web.server.ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email is already registered"
                );

        ResponseEntity<Map<String, String>> response = authController.handleResponseStatusException(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Email is already registered", response.getBody().get("message"));
    }

    @Test
    void handleDataIntegrityViolation_returnsConflictStatusAndMessage() {
        org.springframework.dao.DataIntegrityViolationException ex =
                new org.springframework.dao.DataIntegrityViolationException("Duplicate entry");

        ResponseEntity<Map<String, String>> response = authController.handleDataIntegrityViolation(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Email is already registered", response.getBody().get("message"));
    }
}
