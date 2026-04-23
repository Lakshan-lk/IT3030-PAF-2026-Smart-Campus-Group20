package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.AdminUserCreateRequestDTO;
import com.campushub.smartcampus.dto.AdminUserResponseDTO;
import com.campushub.smartcampus.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<AdminUserResponseDTO> createUser(@Valid @RequestBody AdminUserCreateRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponseDTO> updateTechnician(@PathVariable Long id, @Valid @RequestBody AdminUserCreateRequestDTO dto) {
        return ResponseEntity.ok(adminUserService.updateTechnician(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        adminUserService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }
}
