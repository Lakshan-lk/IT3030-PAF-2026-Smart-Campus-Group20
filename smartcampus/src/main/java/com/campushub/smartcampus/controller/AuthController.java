package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.AuthUserResponseDTO;
import com.campushub.smartcampus.dto.GoogleAuthRequestDTO;
import com.campushub.smartcampus.service.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<AuthUserResponseDTO> authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequestDTO dto) {
        return ResponseEntity.ok(googleAuthService.authenticate(dto.getCredential()));
    }
}
