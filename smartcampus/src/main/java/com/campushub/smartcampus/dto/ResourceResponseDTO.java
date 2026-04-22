package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.ResourceStatus;

import java.time.LocalDateTime;
import java.util.List;

public class ResourceResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String type;
    private String location;
    private String status;
    private Integer capacity;
    private String imageUrl;
    private List<EquipmentDTO> equipment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceResponseDTO() {}

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public List<EquipmentDTO> getEquipment() {
        return equipment;
    }

    public void setEquipment(List<EquipmentDTO> equipment) {
        this.equipment = equipment;
    }

    public List<EquipmentDTO> getEquipments() {
        return equipment;
    }

    public void setEquipments(List<EquipmentDTO> equipments) {
        this.equipment = equipments;
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

    public static ResourceResponseDTO fromEntity(Resource resource, List<Equipment> equipmentList) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setDescription(resource.getDescription());
        dto.setType(resource.getType() != null ? resource.getType().name() : null);
        dto.setLocation(resource.getLocation());
        dto.setStatus(resource.getStatus() != null ? resource.getStatus().name() : ResourceStatus.ACTIVE.name());
        dto.setCapacity(resource.getCapacity());
        dto.setImageUrl(resource.getImageUrl());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());

        if (equipmentList != null) {
            dto.setEquipment(equipmentList.stream()
                    .map(EquipmentDTO::fromEntity)
                    .toList());
        }

        return dto;
    }

    public static ResourceResponseDTO fromEntity(Resource resource) {
        return fromEntity(resource, null);
    }
}