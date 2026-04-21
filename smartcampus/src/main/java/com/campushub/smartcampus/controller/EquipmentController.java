package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentDTO;
import com.campushub.smartcampus.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getEquipment(
            @RequestParam(required = false) Long excludeRoomId) {
        List<EquipmentDTO> result;
        if (excludeRoomId != null) {
            result = equipmentRepository.findByRoomIdNot(excludeRoomId).stream()
                    .map(EquipmentDTO::fromEntity).toList();
        } else {
            result = equipmentRepository.findAll().stream()
                    .map(EquipmentDTO::fromEntity).toList();
        }
        return ResponseEntity.ok(result);
    }
}
