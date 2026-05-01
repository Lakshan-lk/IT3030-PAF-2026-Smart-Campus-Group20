package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.enums.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.StringJoiner;

public class BookingResponseDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private Long userId;
    private String userName;
    private String purpose;
    private Integer attendees;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String formattedStartTime;
    private String formattedEndTime;
    private BookingStatus status;
    private String rejectionReason;
    private boolean isRecurring;
    private String recurrenceGroupId;
    private LocalDate recurrenceEndDate;
    private Map<String, Integer> additionalEquipment;
    private String additionalEquipmentSummary;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public String getFormattedStartTime() {
        return formattedStartTime;
    }

    public void setFormattedStartTime(String formattedStartTime) {
        this.formattedStartTime = formattedStartTime;
    }

    public String getFormattedEndTime() {
        return formattedEndTime;
    }

    public void setFormattedEndTime(String formattedEndTime) {
        this.formattedEndTime = formattedEndTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getAttendees() {
        return attendees;
    }

    public void setAttendees(Integer attendees) {
        this.attendees = attendees;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isRecurring() {
        return isRecurring;
    }

    public void setRecurring(boolean recurring) {
        isRecurring = recurring;
    }

    public String getRecurrenceGroupId() {
        return recurrenceGroupId;
    }

    public void setRecurrenceGroupId(String recurrenceGroupId) {
        this.recurrenceGroupId = recurrenceGroupId;
    }

    public LocalDate getRecurrenceEndDate() {
        return recurrenceEndDate;
    }

    public void setRecurrenceEndDate(LocalDate recurrenceEndDate) {
        this.recurrenceEndDate = recurrenceEndDate;
    }

    public Map<String, Integer> getAdditionalEquipment() {
        return additionalEquipment;
    }

    public void setAdditionalEquipment(Map<String, Integer> additionalEquipment) {
        this.additionalEquipment = additionalEquipment;
    }

    public String getAdditionalEquipmentSummary() {
        return additionalEquipmentSummary;
    }

    public void setAdditionalEquipmentSummary(String additionalEquipmentSummary) {
        this.additionalEquipmentSummary = additionalEquipmentSummary;
    }

    public static BookingResponseDTO fromEntity(Booking booking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setResourceName(booking.getResource().getName());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        dto.setPurpose(booking.getPurpose());
        dto.setAttendees(booking.getAttendees());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setFormattedStartTime(booking.getStartTime().format(formatter));
        dto.setFormattedEndTime(booking.getEndTime().format(formatter));
        dto.setStatus(booking.getStatus());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setRecurring(booking.isRecurring());
        dto.setRecurrenceGroupId(booking.getRecurrenceGroupId());
        dto.setRecurrenceEndDate(booking.getRecurrenceEndDate());
        Map<String, Integer> additionalEquipment = BookingRequestDTO.deserializeAdditionalEquipment(booking.getAdditionalEquipmentRequest());
        dto.setAdditionalEquipment(additionalEquipment);
        dto.setAdditionalEquipmentSummary(formatAdditionalEquipment(additionalEquipment));
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }

    private static String formatAdditionalEquipment(Map<String, Integer> additionalEquipment) {
        if (additionalEquipment == null || additionalEquipment.isEmpty()) {
            return null;
        }

        StringJoiner joiner = new StringJoiner(", ");
        additionalEquipment.forEach((key, value) -> {
            String label = key.toLowerCase().replace('_', ' ');
            String normalized = Character.toUpperCase(label.charAt(0)) + label.substring(1);
            joiner.add(normalized + " x" + value);
        });
        return joiner.toString();
    }
}
