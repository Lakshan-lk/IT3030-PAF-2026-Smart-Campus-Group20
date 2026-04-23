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

import com.campushub.smartcampus.dto.LocalLoginRequestDTO;
import com.campushub.smartcampus.repository.UserRepository;
import com.campushub.smartcampus.entity.User;
import org.springframework.http.HttpStatus;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final UserRepository userRepository;

    public AuthController(GoogleAuthService googleAuthService, UserRepository userRepository) {
        this.googleAuthService = googleAuthService;
        this.userRepository = userRepository;
    }

    @PostMapping("/google")
    public ResponseEntity<AuthUserResponseDTO> authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequestDTO dto) {
        return ResponseEntity.ok(googleAuthService.authenticate(dto.getCredential()));
    }

    @PostMapping("/local")
    public ResponseEntity<AuthUserResponseDTO> authenticateLocal(@Valid @RequestBody LocalLoginRequestDTO dto) {
        User user = userRepository.findByUsernameIgnoreCase(dto.getUsername().trim())
                .orElse(null);
        if (user == null || user.getPassword() == null || !user.getPassword().equals(dto.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(AuthUserResponseDTO.fromEntity(user, false));
    }
}
