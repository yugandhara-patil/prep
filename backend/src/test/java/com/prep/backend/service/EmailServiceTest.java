package com.prep.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Test
    void testEmailServiceWhenMailSenderIsUnavailable() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);

        EmailService emailService = new EmailService(mailSenderProvider);

        assertFalse(emailService.isMailConfigured());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailService.sendPasswordResetEmail("candidate@example.com", "Candidate", "https://prep.app/reset?token=123")
        );
        assertTrue(ex.getMessage().contains("not configured"));
    }

    @Test
    void testEmailServiceWhenMailSenderHasBlankHost() {
        JavaMailSenderImpl implWithBlankHost = new JavaMailSenderImpl();
        implWithBlankHost.setHost("");
        when(mailSenderProvider.getIfAvailable()).thenReturn(implWithBlankHost);

        EmailService emailService = new EmailService(mailSenderProvider);

        assertFalse(emailService.isMailConfigured());
        assertThrows(IllegalStateException.class, () ->
                emailService.sendPasswordResetEmail("candidate@example.com", "Candidate", "https://prep.app/reset?token=123")
        );
    }

    @Test
    void testEmailServiceWhenMailSenderIsAvailableAndConfigured() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(javaMailSender);

        EmailService emailService = new EmailService(mailSenderProvider);

        assertTrue(emailService.isMailConfigured());

        emailService.sendPasswordResetEmail("candidate@example.com", "Candidate", "https://prep.app/reset?token=abc");

        verify(javaMailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testEmailServiceWhenMailSenderImplHasGmailHostWithoutCredentialsIsUnconfigured() {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost("smtp.gmail.com");
        impl.setUsername("");
        impl.setPassword("");
        when(mailSenderProvider.getIfAvailable()).thenReturn(impl);

        EmailService emailService = new EmailService(mailSenderProvider);

        assertFalse(emailService.isMailConfigured());
    }

    @Test
    void testEmailServiceWhenMailSenderImplHasHostAndCredentialsIsConfigured() {
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost("smtp.gmail.com");
        impl.setUsername("prep@example.com");
        impl.setPassword("app-password-123");
        when(mailSenderProvider.getIfAvailable()).thenReturn(impl);

        EmailService emailService = new EmailService(mailSenderProvider);

        assertTrue(emailService.isMailConfigured());
    }

    @Test
    void testEmailServiceWhenBeanNotProvidedByAutoConfigButResolvedPropertiesHaveCredentials() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);

        EmailService emailService = new EmailService(
                mailSenderProvider,
                "smtp.gmail.com",
                587,
                "deployed@example.com",
                "resolved-password",
                true,
                true,
                true
        );

        assertTrue(emailService.isMailConfigured());
    }
}
