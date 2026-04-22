package com.campushub.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequestDTO {

    @NotBlank(message = "Google credential is required")
    private String credential;

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }
}
