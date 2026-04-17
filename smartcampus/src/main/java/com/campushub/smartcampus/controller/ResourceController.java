package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(resourceService.searchResources(search));
        }
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(resourceService.getResourcesByType(type));
        }
        if (location != null && !location.isBlank()) {
            return ResponseEntity.ok(resourceService.getResourcesByLocation(location));
        }
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(resourceService.getResourcesByStatus(status));
        }
        Page<ResourceResponseDTO> page = resourceService.getAllResources(pageable);
        return ResponseEntity.ok(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(@Valid @RequestBody ResourceRequestDTO dto) {
        ResourceResponseDTO created = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}