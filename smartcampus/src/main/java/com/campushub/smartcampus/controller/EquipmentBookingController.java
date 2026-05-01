package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.service.EquipmentBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/equipment-bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EquipmentBookingController {

    @Autowired
    private EquipmentBookingService equipmentBookingService;

    @PostMapping
    public ResponseEntity<EquipmentBookingResponseDTO> createBooking(
            @Valid @RequestBody EquipmentBookingRequestDTO requestDTO) {
        EquipmentBookingResponseDTO response = equipmentBookingService.createBooking(requestDTO.getUserId(), requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<EquipmentBookingResponseDTO>> getAllBookings(Pageable pageable) {
        return ResponseEntity.ok(equipmentBookingService.getAllBookings(pageable));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<Page<EquipmentBookingResponseDTO>> getMyBookings(
            @RequestParam Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(equipmentBookingService.getBookingsByUser(userId, pageable));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<EquipmentBookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<EquipmentBookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequestDTO requestDTO) {
        return ResponseEntity.ok(equipmentBookingService.rejectBooking(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id, @RequestParam Long userId) {
        equipmentBookingService.deleteBooking(id, userId);
        return ResponseEntity.noContent().build();
    }
}
