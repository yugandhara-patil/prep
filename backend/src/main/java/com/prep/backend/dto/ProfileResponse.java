package com.prep.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String targetRole;

    private String currentStatus;

    private String experienceLevel;

    private String skills;

    private String about;

    private String linkedin;

    private String github;

    private String portfolio;

    private String profilePhotoUrl;
}