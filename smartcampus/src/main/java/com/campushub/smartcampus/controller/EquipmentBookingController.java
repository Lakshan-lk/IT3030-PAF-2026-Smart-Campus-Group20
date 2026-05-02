package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
import com.campushub.smartcampus.service.EquipmentBookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/equipment-bookings")
public class EquipmentBookingController {

    private final EquipmentBookingService equipmentBookingService;

    public EquipmentBookingController(EquipmentBookingService equipmentBookingService) {
        this.equipmentBookingService = equipmentBookingService;
    }

    @PostMapping
    public ResponseEntity<EquipmentBookingResponseDTO> createBooking(
            @Valid @RequestBody EquipmentBookingRequestDTO requestDTO) {
        return new ResponseEntity<>(equipmentBookingService.createBooking(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EquipmentBookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(equipmentBookingService.getAllBookings(userId));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<EquipmentBookingResponseDTO>> getMyBookings(
            @RequestParam Long userId,
            Pageable pageable) {
        // Keep the endpoint compatible with the newer frontend hook, but return the same list shape
        // the current app already uses.
        Page<EquipmentBookingResponseDTO> page = equipmentBookingService.getBookingsByUser(userId, pageable);
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentBookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.getBookingById(id));
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

    @PostMapping("/{id}/cancel")
    public ResponseEntity<EquipmentBookingResponseDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.cancelBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        equipmentBookingService.deleteBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/active")
    public ResponseEntity<Long> getActiveBookingCount() {
        return ResponseEntity.ok(equipmentBookingService.getActiveBookingCount());
    }
}
