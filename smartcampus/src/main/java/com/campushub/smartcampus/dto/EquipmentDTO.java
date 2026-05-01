package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Equipment;

import java.util.List;

public class EquipmentDTO {

    private Long id;
    private String name;
    private String type;
    private String status;
    private Long roomId;
    private boolean hiringEquipment;
    private String hireType;
    private String description;
    private List<String> imageUrls;

    public EquipmentDTO() {}

    public static EquipmentDTO fromEntity(Equipment e) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setType(e.getType() != null ? e.getType().name() : null);
        dto.setStatus(e.getStatus());
        if (e.getRoom() != null) {
            dto.setRoomId(e.getRoom().getId());
        }
        dto.setHiringEquipment(e.isHiringEquipment());
        dto.setHireType(e.getHireType());
        dto.setDescription(e.getDescription());
        dto.setImageUrls(e.getImageUrls());
        return dto;
    }

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

    public boolean isHiringEquipment() {
        return hiringEquipment;
    }

    public void setHiringEquipment(boolean hiringEquipment) {
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
