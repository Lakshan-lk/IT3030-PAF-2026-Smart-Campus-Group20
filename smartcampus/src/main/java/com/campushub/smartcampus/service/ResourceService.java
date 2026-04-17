package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getAllResources(Pageable pageable) {
        return resourceRepository.findAll(pageable).map(ResourceResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(ResourceResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getResourcesByType(String type) {
        return resourceRepository.findByType(type).stream()
                .map(ResourceResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location).stream()
                .map(ResourceResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getResourcesByStatus(String status) {
        return resourceRepository.findByStatus(status).stream()
                .map(ResourceResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResourceResponseDTO> searchResources(String keyword) {
        return resourceRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(ResourceResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
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
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}