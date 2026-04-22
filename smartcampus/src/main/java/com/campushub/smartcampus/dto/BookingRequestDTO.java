package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class BookingRequestDTO {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500)
    private String purpose;

    private Integer attendees;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private boolean recurring = false;

    private String recurrencePattern;

    private LocalDate recurrenceEndDate;

    private List<String> skipDates;

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

    public boolean isRecurring() {
        return recurring;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }

    public Integer getAttendees() {
        return attendees;
    }

    public void setAttendees(Integer attendees) {
        this.attendees = attendees;
    }

    public String getRecurrencePattern() {
        return recurrencePattern;
    }

    public void setRecurrencePattern(String recurrencePattern) {
        this.recurrencePattern = recurrencePattern;
    }

    public LocalDate getRecurrenceEndDate() {
        return recurrenceEndDate;
    }

    public void setRecurrenceEndDate(LocalDate recurrenceEndDate) {
        this.recurrenceEndDate = recurrenceEndDate;
    }

    public List<String> getSkipDates() {
        return skipDates;
    }

    public void setSkipDates(List<String> skipDates) {
        this.skipDates = skipDates;
    }

    public static Booking toEntity(BookingRequestDTO dto, Resource resource, User user) {
        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setPurpose(dto.getPurpose());
        booking.setAttendees(dto.getAttendees());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setRecurring(dto.isRecurring());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRecurrencePattern(dto.getRecurrencePattern());
        booking.setRecurrenceEndDate(dto.getRecurrenceEndDate());

        if (dto.getSkipDates() != null && !dto.getSkipDates().isEmpty()) {
            booking.setSkipDates(String.join(",", dto.getSkipDates()));
        }
        return booking;
    }
}
