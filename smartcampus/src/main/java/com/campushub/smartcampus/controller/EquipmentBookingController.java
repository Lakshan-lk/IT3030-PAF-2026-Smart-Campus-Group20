package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
<<<<<<< HEAD
import com.campushub.smartcampus.service.EquipmentBookingService;
import jakarta.validation.Valid;

=======
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.service.EquipmentBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment-bookings")

public class EquipmentBookingController {

    private final EquipmentBookingService equipmentBookingService;
    public EquipmentBookingController(EquipmentBookingService equipmentBookingService) {
        this.equipmentBookingService = equipmentBookingService;
    }
=======
@RestController
@RequestMapping("/api/v1/equipment-bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EquipmentBookingController {

    @Autowired
    private EquipmentBookingService equipmentBookingService;
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82

    @PostMapping
    public ResponseEntity<EquipmentBookingResponseDTO> createBooking(
            @Valid @RequestBody EquipmentBookingRequestDTO requestDTO) {
<<<<<<< HEAD
        return new ResponseEntity<>(equipmentBookingService.createBooking(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EquipmentBookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(equipmentBookingService.getAllBookings(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentBookingResponseDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.getBookingById(id));
=======
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
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<EquipmentBookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<EquipmentBookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequestDTO requestDTO) {
<<<<<<< HEAD
        return ResponseEntity.ok(equipmentBookingService.rejectBooking(id, requestDTO.getReason()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<EquipmentBookingResponseDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentBookingService.cancelBooking(id));
    }

    @GetMapping("/stats/active")
    public ResponseEntity<Long> getActiveBookingCount() {
        return ResponseEntity.ok(equipmentBookingService.getActiveBookingCount());
    }
}

=======
        return ResponseEntity.ok(equipmentBookingService.rejectBooking(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id, @RequestParam Long userId) {
        equipmentBookingService.deleteBooking(id, userId);
        return ResponseEntity.noContent().build();
    }
}
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
