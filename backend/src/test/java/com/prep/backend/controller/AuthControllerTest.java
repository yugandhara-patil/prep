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
}
