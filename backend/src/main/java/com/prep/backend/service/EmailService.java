package com.prep.backend.service;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    @Autowired
    public EmailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${spring.mail.host:${SPRING_MAIL_HOST:${MAIL_HOST:smtp.gmail.com}}}") String configuredHost,
            @Value("${spring.mail.port:${SPRING_MAIL_PORT:${MAIL_PORT:587}}}") int configuredPort,
            @Value("${spring.mail.username:${SPRING_MAIL_USERNAME:${MAIL_USERNAME:}}}") String configuredUsername,
            @Value("${spring.mail.password:${SPRING_MAIL_PASSWORD:${MAIL_PASSWORD:${MAIL_APP_PASSWORD:}}}}") String configuredPassword,
            @Value("${spring.mail.properties.mail.smtp.auth:${SPRING_MAIL_AUTH:true}}") boolean smtpAuth,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:${SPRING_MAIL_STARTTLS_ENABLE:true}}") boolean starttlsEnable,
            @Value("${spring.mail.properties.mail.smtp.starttls.required:${SPRING_MAIL_STARTTLS_REQUIRED:true}}") boolean starttlsRequired
    ) {
        String cleanUsername = configuredUsername != null ? configuredUsername.trim() : "";
        String cleanPassword = configuredPassword != null ? configuredPassword.trim() : "";
        String cleanHost = configuredHost != null && !configuredHost.isBlank() ? configuredHost.trim() : "smtp.gmail.com";
        int cleanPort = configuredPort > 0 ? configuredPort : 587;

        this.fromAddress = !cleanUsername.isEmpty() ? cleanUsername : "noreply@prep.com";

        JavaMailSender sender = mailSenderProvider != null ? mailSenderProvider.getIfAvailable() : null;

        // If Spring Boot auto-configuration did not produce a bean (e.g. spring.mail.host was empty)
        // but spring.mail.username and spring.mail.password are configured, construct the sender dynamically.
        if (sender == null && !cleanUsername.isEmpty() && !cleanPassword.isEmpty()) {
            JavaMailSenderImpl impl = new JavaMailSenderImpl();
            impl.setHost(cleanHost);
            impl.setPort(cleanPort);
            impl.setUsername(cleanUsername);
            impl.setPassword(cleanPassword);
            Properties props = impl.getJavaMailProperties();
            props.put("mail.smtp.auth", String.valueOf(smtpAuth));
            props.put("mail.smtp.starttls.enable", String.valueOf(starttlsEnable));
            props.put("mail.smtp.starttls.required", String.valueOf(starttlsRequired));
            props.put("mail.smtp.connectiontimeout", "5000");
            props.put("mail.smtp.timeout", "5000");
            props.put("mail.smtp.writetimeout", "5000");
            sender = impl;
        } else if (sender instanceof JavaMailSenderImpl impl) {
            // Apply resolved username/password if the auto-configured bean missed them
            if ((impl.getUsername() == null || impl.getUsername().isBlank()) && !cleanUsername.isEmpty()) {
                impl.setUsername(cleanUsername);
            }
            if ((impl.getPassword() == null || impl.getPassword().isBlank()) && !cleanPassword.isEmpty()) {
                impl.setPassword(cleanPassword);
            }
            if ((impl.getHost() == null || impl.getHost().isBlank()) && !cleanHost.isEmpty()) {
                impl.setHost(cleanHost);
            }
        }

        // Validate sender credentials if authentication is required
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

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this(mailSenderProvider, "smtp.gmail.com", 587, "", "", true, true, true);
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
}
