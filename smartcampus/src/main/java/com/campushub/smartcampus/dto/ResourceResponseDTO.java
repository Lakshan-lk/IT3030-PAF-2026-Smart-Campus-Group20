package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Resource;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.enums.ResourceStatus;

public class ResourceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private ResourceType type;
    private String location;
    private ResourceStatus status;
    private Integer capacity;
    private String imageUrl;
    private String amenities;
    private List<EquipmentDTO> equipments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String formattedCreatedAt;
    private String formattedUpdatedAt;
    private boolean bookedForSlot = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public List<EquipmentDTO> getEquipments() {
        return equipments;
    }

    public void setEquipments(List<EquipmentDTO> equipments) {
        this.equipments = equipments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getFormattedCreatedAt() {
        return formattedCreatedAt;
    }

    public void setFormattedCreatedAt(String formattedCreatedAt) {
        this.formattedCreatedAt = formattedCreatedAt;
    }

    public String getFormattedUpdatedAt() {
        return formattedUpdatedAt;
    }

    public void setFormattedUpdatedAt(String formattedUpdatedAt) {
        this.formattedUpdatedAt = formattedUpdatedAt;
    }

    public boolean isBookedForSlot() {
        return bookedForSlot;
    }

    public void setBookedForSlot(boolean bookedForSlot) {
        this.bookedForSlot = bookedForSlot;
    }

    public static ResourceResponseDTO fromEntity(Resource resource) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setDescription(resource.getDescription());
        dto.setType(resource.getType());
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus());
        dto.setCapacity(resource.getCapacity());
        dto.setImageUrl(resource.getImageUrl());
        dto.setAmenities(resource.getAmenities());
        if (resource.getEquipments() != null) {
            dto.setEquipments(resource.getEquipments().stream()
                    .map(EquipmentDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        if (resource.getCreatedAt() != null) {
            dto.setFormattedCreatedAt(resource.getCreatedAt().format(formatter));
        }
        if (resource.getUpdatedAt() != null) {
            dto.setFormattedUpdatedAt(resource.getUpdatedAt().format(formatter));
        }
        return dto;
    }

    public static ResourceResponseDTO fromEntity(Resource resource, boolean bookedForSlot) {
        ResourceResponseDTO dto = fromEntity(resource);
        dto.setBookedForSlot(bookedForSlot);
        return dto;
    }
}