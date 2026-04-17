package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(resourceRepository.findByNameContainingIgnoreCase(search));
        }
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(resourceRepository.findByType(type));
        }
        if (location != null && !location.isBlank()) {
            return ResponseEntity.ok(resourceRepository.findByLocation(location));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(resourceRepository.findByStatus(status));
        }
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource saved = resourceRepository.save(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        return resourceRepository.findById(id)
                .map(existing -> {
                    existing.setName(resource.getName());
                    existing.setDescription(resource.getDescription());
                    existing.setType(resource.getType());
                    existing.setLocation(resource.getLocation());
                    existing.setStatus(resource.getStatus());
                    existing.setCapacity(resource.getCapacity());
                    existing.setImageUrl(resource.getImageUrl());
                    existing.setAmenities(resource.getAmenities());
                    return ResponseEntity.ok(resourceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (!resourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
