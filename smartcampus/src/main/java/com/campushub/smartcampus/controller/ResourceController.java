package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.service.ResourceImageService;
import com.campushub.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceImageService resourceImageService;

    public ResourceController(ResourceService resourceService, ResourceImageService resourceImageService) {
        this.resourceService = resourceService;
        this.resourceImageService = resourceImageService;
    }

    @GetMapping
    public ResponseEntity<Page<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> equipmentTypes,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @PageableDefault(size = 20) Pageable pageable) {
        
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;
        
        if (date != null && startTime != null && endTime != null) {
            try {
                startDateTime = LocalDateTime.parse(date + "T" + startTime + ":00");
                endDateTime = LocalDateTime.parse(date + "T" + endTime + ":00");
            } catch (Exception e) {
                // Invalid date/time format, ignore
            }
        }
        
        Page<ResourceResponseDTO> page = resourceService.getResources(type, location, status, search, equipmentTypes, minCapacity, pageable, startDateTime, endDateTime);
        return ResponseEntity.ok(page);
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

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws Exception {
        String imageUrl = resourceImageService.storeResourceImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
