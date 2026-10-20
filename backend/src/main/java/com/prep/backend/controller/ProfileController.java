package com.prep.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prep.backend.dto.ProfileRequest;
import com.prep.backend.dto.ProfileResponse;
import com.prep.backend.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // GET logged-in user's profile
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        ProfileResponse profile =
                userService.getProfile(email);

        return ResponseEntity.ok(profile);
    }

    // UPDATE logged-in user's profile
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody ProfileRequest request
    ) {

        String email = authentication.getName();

        ProfileResponse updatedProfile =
                userService.updateProfile(
                        email,
                        request
                );

        return ResponseEntity.ok(updatedProfile);
    }

    // UPLOAD profile photo
    @org.springframework.web.bind.annotation.PostMapping(value = "/photo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadProfilePhoto(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        String email = authentication.getName();

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "photo.jpg";
        }

        String lower = originalFilename.toLowerCase();
        if (!lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".png") && !lower.endsWith(".webp")) {
            throw new RuntimeException("Only JPG, PNG, and WebP images are allowed.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Photo size must be less than 5 MB");
        }

        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "avatars");
            java.nio.file.Files.createDirectories(uploadDir);

            String ext = lower.substring(lower.lastIndexOf("."));
            String fileName = "avatar_" + System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString().substring(0, 8) + ext;
            java.nio.file.Path destination = uploadDir.resolve(fileName);

            java.nio.file.Files.copy(file.getInputStream(), destination, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/api/profile/photo/" + fileName;
            ProfileResponse updatedProfile = userService.updateProfilePhoto(email, photoUrl);

            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save profile photo: " + e.getMessage(), e);
        }
    }

    // GET / SERVE profile photo
    @GetMapping("/photo/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfilePhoto(
            @org.springframework.web.bind.annotation.PathVariable String fileName
    ) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", "avatars").resolve(fileName).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "image/jpeg";
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".png")) {
                contentType = "image/png";
            } else if (lower.endsWith(".webp")) {
                contentType = "image/webp";
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}