package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.AuthUserResponseDTO;
import com.campushub.smartcampus.dto.GoogleAuthRequestDTO;
import com.campushub.smartcampus.service.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campushub.smartcampus.dto.LocalLoginRequestDTO;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.repository.UserRepository;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

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

    /**
     * Returns the admin user from the database so the frontend can use the real DB id.
     * Called immediately after the hardcoded admin login succeeds.
     */
    @GetMapping("/admin-me")
    public ResponseEntity<Map<String, Object>> getAdminUser() {
        User adminUser = userRepository.findFirstByRoleIgnoreCase("ADMIN").orElse(null);
        Map<String, Object> result = new HashMap<>();
        if (adminUser == null) {
            result.put("id", -1L);
            result.put("role", "admin");
            result.put("name", "System Administrator");
        } else {
            result.put("id", adminUser.getId());
            result.put("role", adminUser.getRole().toLowerCase());
            result.put("name", adminUser.getName() != null ? adminUser.getName() : "System Administrator");
            result.put("email", adminUser.getEmail() != null ? adminUser.getEmail() : "");
        }
        return ResponseEntity.ok(result);
    }
}
