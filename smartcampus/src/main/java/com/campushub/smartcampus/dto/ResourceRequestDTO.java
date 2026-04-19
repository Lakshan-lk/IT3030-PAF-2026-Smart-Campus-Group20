package com.campushub.smartcampus.dto;

import jakarta.validation.constraints.Size;

public class ResourceRequestDTO {

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 30)
    private String type;

    @Size(max = 200)
    private String location;

    @Size(max = 20)
    private String status;

    private Integer capacity;

    @Size(max = 500)
    private String imageUrl;

    public ResourceRequestDTO() {}

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
}