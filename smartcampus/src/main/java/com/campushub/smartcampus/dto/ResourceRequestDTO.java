package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotBlank(message = "Resource type is required")
    private String type;

    private String location;

    private String status;

    private Integer capacity;

    private String imageUrl;

    private String amenities;

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

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public static Resource toEntity(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        resource.setStatus(dto.getStatus() != null ? dto.getStatus() : "AVAILABLE");
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());
        resource.setAmenities(dto.getAmenities());
        return resource;
    }
}