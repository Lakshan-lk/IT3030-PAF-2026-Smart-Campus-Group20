package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getResources(String type, String location, String status, String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return resourceRepository.findByNameContainingIgnoreCaseAndIsDeletedFalse(search, pageable).map(ResourceResponseDTO::fromEntity);
        }
        if (type != null && !type.isBlank()) {
            try {
                ResourceType rt = ResourceType.valueOf(type.toUpperCase());
                return resourceRepository.findByTypeAndIsDeletedFalse(rt, pageable).map(ResourceResponseDTO::fromEntity);
            } catch (IllegalArgumentException e) {
                // Return empty page if enum is invalid
                return Page.empty(pageable);
            }
        }
        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationContainingIgnoreCaseAndIsDeletedFalse(location, pageable).map(ResourceResponseDTO::fromEntity);
        }
        if (status != null && !status.isBlank()) {
            try {
                ResourceStatus rs = ResourceStatus.valueOf(status.toUpperCase());
                return resourceRepository.findByStatusAndIsDeletedFalse(rs, pageable).map(ResourceResponseDTO::fromEntity);
            } catch (IllegalArgumentException e) {
                return Page.empty(pageable);
            }
        }
        return resourceRepository.findByIsDeletedFalse(pageable).map(ResourceResponseDTO::fromEntity);
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