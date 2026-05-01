package com.campushub.smartcampus.dto;

<<<<<<< HEAD
import java.time.LocalDateTime;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EquipmentBookingRequestDTO {
    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long id) { this.equipmentId = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long id) { this.userId = id; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String p) { this.purpose = p; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime t) { this.startTime = t; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime t) { this.endTime = t; }

// EquipmentBookingRequestDTO {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Purpose is required")
    private String purpose;
=======
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EquipmentBookingRequestDTO {
    
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;
<<<<<<< HEAD
=======

    @NotBlank(message = "Purpose is required")
    private String purpose;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
}
