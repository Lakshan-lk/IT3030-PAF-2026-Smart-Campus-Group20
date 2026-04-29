package com.campushub.smartcampus.dto;

import java.util.List;

public class EquipmentRequestDTO {

    private String name;
    private String type;

    private String status;

    private Long roomId;

    private Boolean hiringEquipment;

    private String hireType;

    private String description;

    private List<String> imageUrls;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Boolean getHiringEquipment() {
        return hiringEquipment;
    }

    public void setHiringEquipment(Boolean hiringEquipment) {
        this.hiringEquipment = hiringEquipment;
    }

    public String getHireType() {
        return hireType;
    }

    public void setHireType(String hireType) {
        this.hireType = hireType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
