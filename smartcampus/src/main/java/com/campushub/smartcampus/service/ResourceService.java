package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.repository.BookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, 
                           EquipmentRepository equipmentRepository,
                           BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(resource -> {
                    List<Equipment> equipment = equipmentRepository.findByRoomId(resource.getId());
                    return ResourceResponseDTO.fromEntity(resource, equipment);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAvailableResources(
            String type, 
            Integer minCapacity, 
            String hasEquipment,
            LocalDateTime startTime, 
            LocalDateTime endTime,
            String status) {
        
        List<Resource> resources = resourceRepository.findAll().stream().collect(Collectors.toList());
        
        if (type != null && !type.isBlank()) {
            resources = resources.stream()
                    .filter(r -> type.equalsIgnoreCase(r.getType()))
                    .collect(Collectors.toList());
        }
        
        if (minCapacity != null && minCapacity > 0) {
            resources = resources.stream()
                    .filter(r -> r.getCapacity() != null && r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }
        
        if (hasEquipment != null && !hasEquipment.isBlank()) {
            EquipmentType equipType = EquipmentType.valueOf(hasEquipment);
            Set<Long> roomIdsWithEquipment = equipmentRepository.findAll().stream()
                    .filter(e -> e.getType() == equipType)
                    .map(e -> e.getRoom().getId())
                    .collect(Collectors.toSet());
            resources = resources.stream()
                    .filter(r -> roomIdsWithEquipment.contains(r.getId()))
                    .collect(Collectors.toList());
        }
        
        if (startTime != null && endTime != null) {
            Set<Long> conflictedResourceIds = bookingRepository.findAll().stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                    .filter(b -> b.getStartTime().isBefore(endTime) && b.getEndTime().isAfter(startTime))
                    .map(b -> b.getResource().getId())
                    .collect(Collectors.toSet());
            resources = resources.stream()
                    .filter(r -> !conflictedResourceIds.contains(r.getId()))
                    .collect(Collectors.toList());
        }
        
        if (status != null && !status.isBlank()) {
            ResourceStatus resourceStatus = ResourceStatus.valueOf(status);
            resources = resources.stream()
                    .filter(r -> r.getStatus() == resourceStatus)
                    .collect(Collectors.toList());
        }
        
        return resources.stream()
                .map(resource -> {
                    List<Equipment> equipment = equipmentRepository.findByRoomId(resource.getId());
                    return ResourceResponseDTO.fromEntity(resource, equipment);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
        List<Equipment> equipment = equipmentRepository.findByRoomId(id);
        return ResourceResponseDTO.fromEntity(resource, equipment);
    }

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            resource.setStatus(ResourceStatus.valueOf(dto.getStatus()));
        } else {
            resource.setStatus(ResourceStatus.ACTIVE);
        }

        Resource saved = resourceRepository.save(resource);
        return ResourceResponseDTO.fromEntity(saved, List.of());
    }

    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            resource.setStatus(ResourceStatus.valueOf(dto.getStatus()));
        }

        Resource saved = resourceRepository.save(resource);
        List<Equipment> equipment = equipmentRepository.findByRoomId(id);
        return ResourceResponseDTO.fromEntity(saved, equipment);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}