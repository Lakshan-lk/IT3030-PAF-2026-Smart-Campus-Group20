package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final EquipmentRepository equipmentRepository;

    public ResourceService(ResourceRepository resourceRepository, EquipmentRepository equipmentRepository) {
        this.resourceRepository = resourceRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getResources(String type, String location, String status, String search,
                                          List<String> equipmentTypes, Integer minCapacity, Pageable pageable) {
        Page<Resource> resources;

        if (search != null && !search.isBlank()) {
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

        if ((equipmentTypes != null && !equipmentTypes.isEmpty()) || minCapacity != null) {
            Set<Long> finalRoomsWithEquipment;
            Set<Long> roomsWithEquipment = null;
            if (equipmentTypes != null && !equipmentTypes.isEmpty()) {
                List<EquipmentType> eqTypes = equipmentTypes.stream()
                        .map(et -> {
                            try {
                                return EquipmentType.valueOf(et.toUpperCase());
                            } catch (IllegalArgumentException e) {
                                return null;
                            }
                        })
                        .filter(et -> et != null)
                        .collect(Collectors.toList());

                if (!eqTypes.isEmpty()) {
                    List<Equipment> equipmentList = equipmentRepository.findAll();
                    roomsWithEquipment = equipmentList.stream()
                            .filter(eq -> eqTypes.contains(eq.getType()))
                            .map(eq -> eq.getRoom().getId())
                            .collect(Collectors.toSet());
                }
            }
            finalRoomsWithEquipment = roomsWithEquipment;

            List<Resource> filtered = resources.getContent().stream()
                    .filter(r -> {
                        boolean matchesEquipment = true;
                        boolean matchesCapacity = true;

                        if (finalRoomsWithEquipment != null) {
                            matchesEquipment = finalRoomsWithEquipment.contains(r.getId());
                        }

                        if (minCapacity != null) {
                            matchesCapacity = r.getCapacity() != null && r.getCapacity() >= minCapacity;
                        }

                        return matchesEquipment && matchesCapacity;
                    })
                    .toList();

            List<ResourceResponseDTO> filteredDto = filtered.stream()
                    .map(ResourceResponseDTO::fromEntity)
                    .toList();

            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), filteredDto.size());
            List<ResourceResponseDTO> pageContent = start < filteredDto.size() ? filteredDto.subList(start, end) : List.of();

            return new PageImpl<>(pageContent, pageable, filteredDto.size());
        }

        return resources.map(ResourceResponseDTO::fromEntity);
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