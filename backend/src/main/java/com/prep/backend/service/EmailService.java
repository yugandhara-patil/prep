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

    @Value("${spring.mail.username:${MAIL_USERNAME:${SPRING_MAIL_USERNAME:}}}")
    private String fromAddress;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender instanceof JavaMailSenderImpl impl) {
            String host = impl.getHost();
            if (host == null || host.trim().isEmpty()) {
                sender = null;
            } else {
                String authProp = impl.getJavaMailProperties() != null
                        ? impl.getJavaMailProperties().getProperty("mail.smtp.auth")
                        : null;
                boolean authRequired = "true".equalsIgnoreCase(authProp)
                        || host.toLowerCase().contains("gmail.com");
                if (authRequired) {
                    String username = impl.getUsername();
                    String password = impl.getPassword();
                    if (username == null || username.trim().isEmpty()
                            || password == null || password.trim().isEmpty()) {
                        log.warn("SMTP host is set to '{}' (auth required), but username or password is not configured. EmailService operates in unconfigured mode.", host);
                        sender = null;
                    }
                }
            }
        }
        this.mailSender = sender;

        if (this.mailSender != null) {
            log.info("EmailService initialized with active JavaMailSender.");
        } else {
            log.info("EmailService initialized in disabled/unconfigured mode. SMTP settings not provided; email operations will return HTTP 503.");
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
            String effectiveFrom = (fromAddress != null && !fromAddress.trim().isEmpty())
                    ? fromAddress.trim()
                    : (mailSender instanceof JavaMailSenderImpl impl && impl.getUsername() != null && !impl.getUsername().isBlank())
                            ? impl.getUsername().trim()
                            : "noreply@prep.com";
            message.setFrom(effectiveFrom);
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
            throw ex;
        }
    }

    /**
     * Sends an account deletion verification email with a confirmation link and 6-digit code.
     */
    public void sendAccountDeletionVerificationEmail(String toEmail, String recipientName, String verificationLink, String verificationCode) {
        if (!isMailConfigured()) {
            log.warn("Account deletion verification email requested for {}, but SMTP is not configured.", toEmail);
            throw new IllegalStateException("SMTP email service is currently not configured on this server.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String effectiveFrom = (fromAddress != null && !fromAddress.trim().isEmpty())
                    ? fromAddress.trim()
                    : (mailSender instanceof JavaMailSenderImpl impl && impl.getUsername() != null && !impl.getUsername().isBlank())
                            ? impl.getUsername().trim()
                            : "noreply@prep.com";
            message.setFrom(effectiveFrom);
            message.setTo(toEmail);
            message.setSubject("Confirm Permanent Deletion of Your Prep Account");
            message.setText(
                    "Hello " + (recipientName != null && !recipientName.isBlank() ? recipientName : "there") + ",\n\n"
                    + "We received a request to permanently delete your Prep account (" + toEmail + ").\n\n"
                    + "If you requested this, you can confirm permanent deletion by clicking the link below:\n\n"
                    + verificationLink + "\n\n"
                    + "Alternatively, enter this 6-digit confirmation code on your Profile page:\n"
                    + verificationCode + "\n\n"
                    + "This link and confirmation code will expire in 15 minutes.\n\n"
                    + "WARNING: Deleting your account is permanent. All your interview records, scorecards, and profile information will be permanently deleted.\n\n"
                    + "If you did NOT request to delete your account, please ignore this email or cancel the deletion on your profile. Your account will not be deleted.\n\n"
                    + "Best regards,\nThe Prep Team"
            );

            mailSender.send(message);
            log.info("Account deletion verification email successfully sent to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send account deletion email to {}: {}", toEmail, ex.getMessage(), ex);
            throw ex;
        }
    }
}
