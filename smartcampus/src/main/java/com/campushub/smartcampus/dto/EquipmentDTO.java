package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.enums.EquipmentType;

public class EquipmentDTO {

    private Long id;
    private String name;
    private EquipmentType type;
    private String status;
    private Long roomId;

    public EquipmentDTO() {}

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

    public EquipmentType getType() {
        return type;
    }

    public void setType(EquipmentType type) {
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

    public static EquipmentDTO fromEntity(Equipment equipment) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(equipment.getId());
        dto.setName(equipment.getName());
        dto.setType(equipment.getType());
        dto.setStatus(equipment.getStatus());
        if (equipment.getRoom() != null) {
            dto.setRoomId(equipment.getRoom().getId());
        }
        return dto;
    }
}