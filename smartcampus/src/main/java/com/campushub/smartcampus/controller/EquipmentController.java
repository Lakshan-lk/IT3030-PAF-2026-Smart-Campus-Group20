package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.EquipmentDTO;
import com.campushub.smartcampus.dto.EquipmentRequestDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import com.campushub.smartcampus.util.StatusMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Comparator;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final ResourceRepository resourceRepository;

    public EquipmentController(EquipmentRepository equipmentRepository, ResourceRepository resourceRepository) {
        this.equipmentRepository = equipmentRepository;
        this.resourceRepository = resourceRepository;
    }

    @GetMapping("/equipment")
    public ResponseEntity<List<EquipmentDTO>> getAllEquipment(
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long excludeRoomId) {
        List<Equipment> equipment;
        if (roomId != null) {
            equipment = equipmentRepository.findByRoomId(roomId);
        } else if (excludeRoomId != null) {
            equipment = equipmentRepository.findByRoomIdNot(excludeRoomId);
        } else {
            equipment = equipmentRepository.findAll();
        }

        List<EquipmentDTO> dtos = equipment.stream()
                .sorted(Comparator.comparing(Equipment::getId))
                .map(EquipmentDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/resources/{roomId}/equipment")
    public ResponseEntity<List<EquipmentDTO>> getEquipmentByRoom(@PathVariable Long roomId) {
        List<Equipment> equipment = equipmentRepository.findByRoomId(roomId);
        List<EquipmentDTO> dtos = equipment.stream()
                .map(EquipmentDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/resources/{roomId}/equipment")
    public ResponseEntity<EquipmentDTO> createEquipment(
            @PathVariable Long roomId,
            @Valid @RequestBody EquipmentRequestDTO dto) {
        validateName(dto.getName());
        validateRoomEquipmentType(dto.getType());

        Resource room = resourceRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + roomId));

        Equipment equipment = new Equipment();
        equipment.setName(dto.getName());
        equipment.setType(EquipmentType.valueOf(dto.getType()));
        equipment.setStatus(StatusMapper.normalizeEquipmentStatus(dto.getStatus()));
        equipment.setRoom(room);
        equipment.setHiringEquipment(false);
        equipment.setHireType(null);
        equipment.setDescription(dto.getDescription());
        equipment.setImageUrls(dto.getImageUrls() != null ? dto.getImageUrls() : List.of());

        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.status(HttpStatus.CREATED).body(EquipmentDTO.fromEntity(saved));
    }

    @PostMapping("/equipment")
    public ResponseEntity<EquipmentDTO> createStandaloneEquipment(@Valid @RequestBody EquipmentRequestDTO dto) {
        validateName(dto.getName());

        Equipment equipment = new Equipment();
        equipment.setName(dto.getName());
        equipment.setStatus(StatusMapper.normalizeEquipmentStatus(dto.getStatus()));
        equipment.setDescription(dto.getDescription());
        equipment.setImageUrls(dto.getImageUrls() != null ? dto.getImageUrls() : List.of());

        boolean hiringEquipment = Boolean.TRUE.equals(dto.getHiringEquipment());
        equipment.setHiringEquipment(hiringEquipment);

        if (hiringEquipment) {
            if (dto.getHireType() == null || dto.getHireType().isBlank()) {
                throw new IllegalArgumentException("Hire type is required for hiring equipment");
            }
            equipment.setHireType(dto.getHireType().trim());
            equipment.setType(null);
            equipment.setRoom(null);
        } else {
            if (dto.getRoomId() == null) {
                throw new EntityNotFoundException("Room id is required for room equipment");
            }
            validateRoomEquipmentType(dto.getType());
            Resource room = resourceRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + dto.getRoomId()));
            equipment.setType(EquipmentType.valueOf(dto.getType()));
            equipment.setRoom(room);
            equipment.setHireType(null);
        }

        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.status(HttpStatus.CREATED).body(EquipmentDTO.fromEntity(saved));
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<EquipmentDTO> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequestDTO dto) {
        validateName(dto.getName());

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + id));

        equipment.setName(dto.getName());
        if (dto.getStatus() != null) {
            equipment.setStatus(StatusMapper.normalizeEquipmentStatus(dto.getStatus()));
        }
        equipment.setDescription(dto.getDescription());
        equipment.setImageUrls(dto.getImageUrls() != null ? dto.getImageUrls() : List.of());

        boolean hiringEquipment = Boolean.TRUE.equals(dto.getHiringEquipment()) || equipment.isHiringEquipment();
        equipment.setHiringEquipment(hiringEquipment);

        if (hiringEquipment) {
            if (dto.getHireType() == null || dto.getHireType().isBlank()) {
                throw new IllegalArgumentException("Hire type is required for hiring equipment");
            }
            equipment.setHireType(dto.getHireType().trim());
            equipment.setType(null);
            equipment.setRoom(null);
        } else {
            validateRoomEquipmentType(dto.getType());
            equipment.setType(EquipmentType.valueOf(dto.getType()));
            equipment.setHireType(null);
            if (dto.getRoomId() != null) {
                Resource room = resourceRepository.findById(dto.getRoomId())
                        .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + dto.getRoomId()));
                equipment.setRoom(room);
            }
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

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
    }

    private void validateRoomEquipmentType(String type) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Type is required for room equipment");
        }
    }
}
