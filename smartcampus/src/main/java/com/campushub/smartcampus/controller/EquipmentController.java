package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentDTO;
import com.campushub.smartcampus.dto.EquipmentRequestDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final ResourceRepository resourceRepository;

    public EquipmentController(EquipmentRepository equipmentRepository, ResourceRepository resourceRepository) {
        this.equipmentRepository = equipmentRepository;
        this.resourceRepository = resourceRepository;
    }

    @GetMapping("/resources/{roomId}/equipment")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentByRoom(@PathVariable Long roomId) {
        List<Equipment> equipment = equipmentRepository.findByRoomId(roomId);
        List<EquipmentDTO> dtos = equipment.stream()
                .map(EquipmentDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentExcludingRoom(
            @RequestParam(required = false) Long excludeRoomId) {
        List<Equipment> equipment;
        if (excludeRoomId != null) {
            equipment = equipmentRepository.findByRoomIdNot(excludeRoomId);
        } else {
            equipment = equipmentRepository.findAll();
        }
        List<EquipmentDTO> dtos = equipment.stream()
                .map(EquipmentDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/resources/{roomId}/equipment")
    public ResponseEntity<EquipmentDTO> createEquipment(
            @PathVariable Long roomId,
            @Valid @RequestBody EquipmentRequestDTO dto) {
        Resource room = resourceRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + roomId));

        Equipment equipment = new Equipment();
        equipment.setName(dto.getName());
        equipment.setType(EquipmentType.valueOf(dto.getType()));
        equipment.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        equipment.setRoom(room);

        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.status(HttpStatus.CREATED).body(EquipmentDTO.fromEntity(saved));
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequestDTO dto) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + id));

        equipment.setName(dto.getName());
        equipment.setType(EquipmentType.valueOf(dto.getType()));
        if (dto.getStatus() != null) {
            equipment.setStatus(dto.getStatus());
        }

        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.ok(EquipmentDTO.fromEntity(saved));
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new EntityNotFoundException("Equipment not found with id: " + id);
        }
        equipmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
