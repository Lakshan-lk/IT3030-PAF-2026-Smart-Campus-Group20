package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class BookingRequestDTO {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500)
    private String purpose;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private Integer attendees;

    private Boolean recurring = false;

    private String recurrencePattern;

    private LocalDateTime recurrenceEndDate;

    private java.util.List<String> skipDates;

    private java.util.List<Long> requestedEquipmentIds;

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public Integer getAttendees() {
        return attendees;
    }

    public void setAttendees(Integer attendees) {
        this.attendees = attendees;
    }

    public Boolean getRecurring() {
        return recurring;
    }

    public void setRecurring(Boolean recurring) {
        this.recurring = recurring;
    }

    public String getRecurrencePattern() {
        return recurrencePattern;
    }

    public void setRecurrencePattern(String recurrencePattern) {
        this.recurrencePattern = recurrencePattern;
    }

    public LocalDateTime getRecurrenceEndDate() {
        return recurrenceEndDate;
    }

    public void setRecurrenceEndDate(LocalDateTime recurrenceEndDate) {
        this.recurrenceEndDate = recurrenceEndDate;
    }

    public java.util.List<String> getSkipDates() {
        return skipDates;
    }

    public void setSkipDates(java.util.List<String> skipDates) {
        this.skipDates = skipDates;
    }

    public java.util.List<Long> getRequestedEquipmentIds() {
        return requestedEquipmentIds;
    }

    public void setRequestedEquipmentIds(java.util.List<Long> requestedEquipmentIds) {
        this.requestedEquipmentIds = requestedEquipmentIds;
    }

    public static Booking toEntity(BookingRequestDTO dto, Resource resource, User user) {
        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setPurpose(dto.getPurpose());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setStatus(BookingStatus.PENDING);
        booking.setAttendees(dto.getAttendees());
        booking.setIsRecurring(dto.getRecurring() != null ? dto.getRecurring() : false);
        booking.setRecurrencePattern(dto.getRecurrencePattern());
        booking.setRecurrenceEndDate(dto.getRecurrenceEndDate());
        if (dto.getRequestedEquipmentIds() != null && !dto.getRequestedEquipmentIds().isEmpty()) {
            booking.setRequestedEquipmentIds(dto.getRequestedEquipmentIds().stream()
                    .map(String::valueOf).reduce((a, b) -> a + "," + b).orElse(null));
        }
        return booking;
    }
}
