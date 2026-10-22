package com.prep.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.prep.backend.dto.MessageResponse;
import com.prep.backend.service.UserService;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private ProfileController profileController;

    private final Authentication authentication =
            new TestingAuthenticationToken("candidate@example.com", "password");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(profileController).build();
    }

    @Test
    void deleteAccount_withDeleteMethod_succeeds() throws Exception {
        when(userService.deleteAccount("candidate@example.com"))
                .thenReturn(new MessageResponse("Account deleted successfully"));

        mockMvc.perform(delete("/api/profile").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deleted successfully"));

        verify(userService).deleteAccount("candidate@example.com");
    }

    @Test
    void deleteAccount_withPostDeleteMethod_succeeds() throws Exception {
        when(userService.deleteAccount("candidate@example.com"))
                .thenReturn(new MessageResponse("Account deleted successfully"));

        mockMvc.perform(post("/api/profile/delete").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deleted successfully"));

        verify(userService).deleteAccount("candidate@example.com");
    }
}
