package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Equipment;

public class EquipmentDTO {

    private Long id;
    private String name;
    private String type;
    private String status;
    private Long roomId;

    public EquipmentDTO() {}

    public static EquipmentDTO fromEntity(Equipment e) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setType(e.getType().name());
        dto.setStatus(e.getStatus());
        if (e.getRoom() != null) {
            dto.setRoomId(e.getRoom().getId());
        }
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
}