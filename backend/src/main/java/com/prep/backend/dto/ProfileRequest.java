package com.prep.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {

    private String fullName;

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