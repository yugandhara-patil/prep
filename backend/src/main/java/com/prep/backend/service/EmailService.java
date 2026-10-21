package com.prep.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String fromAddress;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender instanceof JavaMailSenderImpl impl) {
            String host = impl.getHost();
            if (host == null || host.trim().isEmpty()) {
                sender = null;
            }
        }
        this.mailSender = sender;

        if (this.mailSender != null) {
            log.info("EmailService initialized with active JavaMailSender.");
        } else {
            log.info("EmailService initialized in disabled/unconfigured mode. SMTP settings not provided; password-reset emails will return HTTP 503.");
        }
    }

    /**
     * Checks if a valid JavaMailSender is available for outgoing emails.
     */
    public boolean isMailConfigured() {
        return this.mailSender != null;
    }

    /**
     * Sends a password reset email to the candidate.
     * Throws an exception if email is unconfigured or if transmission fails.
     */
    public void sendPasswordResetEmail(String toEmail, String recipientName, String resetLink) {
        if (!isMailConfigured()) {
            log.warn("Password reset email delivery attempted for {}, but SMTP is not configured.", toEmail);
            throw new IllegalStateException("SMTP email service is currently not configured on this server.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.trim().isEmpty()) {
                message.setFrom(fromAddress.trim());
            }
            message.setTo(toEmail);
            message.setSubject("Reset your Prep password");
            message.setText(
                    "Hello " + (recipientName != null && !recipientName.isBlank() ? recipientName : "there") + ",\n\n"
                    + "We received a request to reset your Prep password.\n\n"
                    + "Click the link below to choose a new password. "
                    + "This link expires in 15 minutes and can only be used once:\n\n"
                    + resetLink + "\n\n"
                    + "If you did not request this password reset, please ignore this email.\n\n"
                    + "Best regards,\nThe Prep Team"
            );

            mailSender.send(message);
            log.info("Password reset email successfully sent to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("Failed to deliver password reset email: " + ex.getMessage(), ex);
        }
    }
}
