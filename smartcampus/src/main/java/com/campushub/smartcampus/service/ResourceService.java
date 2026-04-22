package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.repository.BookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, EquipmentRepository equipmentRepository, BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getResources(String type, String location, String status, String search,
                                          List<String> equipmentTypes, Integer minCapacity, Pageable pageable,
                                          LocalDateTime startTime, LocalDateTime endTime) {
        Page<Resource> resources;

        if (startTime != null && endTime != null) {
            Page<Resource> allAvailable = resourceRepository.findByStatusAndIsDeletedFalse(ResourceStatus.AVAILABLE, pageable);
            Set<Long> bookedIds = new HashSet<>(bookingRepository.findBookedResourceIds(startTime, endTime));
            List<Resource> candidates = allAvailable.getContent();
            candidates = applyEquipmentAndCapacityFilter(candidates, equipmentTypes, minCapacity);
            List<ResourceResponseDTO> dtos = candidates.stream()
                    .map(r -> ResourceResponseDTO.fromEntity(r, bookedIds.contains(r.getId())))
                    .sorted(Comparator.comparing(ResourceResponseDTO::isBookedForSlot))
                    .toList();
            return new PageImpl<>(dtos, pageable, dtos.size());
        } else if (search != null && !search.isBlank()) {
            resources = resourceRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(search, pageable);
        } else if (type != null && !type.isBlank()) {
            try {
                ResourceType rt = ResourceType.valueOf(type.toUpperCase());
                resources = resourceRepository.findByTypeAndIsDeletedFalse(rt, pageable);
            } catch (IllegalArgumentException e) {
                return Page.empty(pageable);
            }
        } else if (location != null && !location.isBlank()) {
            resources = resourceRepository.findByLocationContainingIgnoreCaseAndIsDeletedFalse(location, pageable);
        } else if (status != null && !status.isBlank()) {
            try {
                ResourceStatus rs = ResourceStatus.valueOf(status.toUpperCase());
                resources = resourceRepository.findByStatusAndIsDeletedFalse(rs, pageable);
            } catch (IllegalArgumentException e) {
                return Page.empty(pageable);
            }
        } else {
            resources = resourceRepository.findByIsDeletedFalse(pageable);
        }

        List<Resource> filtered = applyEquipmentAndCapacityFilter(resources.getContent(), equipmentTypes, minCapacity);
        if (filtered.size() != resources.getContent().size()) {
            List<ResourceResponseDTO> filteredDto = filtered.stream().map(ResourceResponseDTO::fromEntity).toList();
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), filteredDto.size());
            List<ResourceResponseDTO> pageContent = start < filteredDto.size() ? filteredDto.subList(start, end) : List.of();
            return new PageImpl<>(pageContent, pageable, filteredDto.size());
        }

        return resources.map(ResourceResponseDTO::fromEntity);
    }

    private List<Resource> applyEquipmentAndCapacityFilter(List<Resource> resources, List<String> equipmentTypes, Integer minCapacity) {
        if ((equipmentTypes == null || equipmentTypes.isEmpty()) && minCapacity == null) {
            return resources;
        }
        Set<Long> roomsWithEquipment = null;
        if (equipmentTypes != null && !equipmentTypes.isEmpty()) {
            List<EquipmentType> eqTypes = equipmentTypes.stream()
                    .map(et -> { try { return EquipmentType.valueOf(et.toUpperCase()); } catch (IllegalArgumentException e) { return null; } })
                    .filter(et -> et != null)
                    .collect(Collectors.toList());
            if (!eqTypes.isEmpty()) {
                roomsWithEquipment = equipmentRepository.findAll().stream()
                        .filter(eq -> eqTypes.contains(eq.getType()))
                        .map(eq -> eq.getRoom().getId())
                        .collect(Collectors.toSet());
            }
        }
        final Set<Long> finalRooms = roomsWithEquipment;
        return resources.stream()
                .filter(r -> {
                    boolean matchesEq = finalRooms == null || finalRooms.contains(r.getId());
                    boolean matchesCap = minCapacity == null || (r.getCapacity() != null && r.getCapacity() >= minCapacity);
                    return matchesEq && matchesCap;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
        if (resource.isDeleted()) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        return ResourceResponseDTO.fromEntity(resource);
    }

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        if (dto.getCapacity() != null && dto.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than 0");
        }

        Resource resource = ResourceRequestDTO.toEntity(dto);
        Resource saved = resourceRepository.save(resource);
        return ResourceResponseDTO.fromEntity(saved);
    }

    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
        
        if (resource.isDeleted()) {
             throw new EntityNotFoundException("Resource not found with id: " + id);
        }

        if (dto.getCapacity() != null && dto.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than 0");
        }

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        if (dto.getStatus() != null) {
            resource.setStatus(dto.getStatus());
        }
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());
        resource.setAmenities(dto.getAmenities());

        Resource saved = resourceRepository.save(resource);
        return ResourceResponseDTO.fromEntity(saved);
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
        resource.setDeleted(true);
        resourceRepository.save(resource);
    }
}