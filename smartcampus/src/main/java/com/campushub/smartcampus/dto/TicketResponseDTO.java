package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.Ticket;
import java.time.LocalDateTime;
import java.util.List;

public class TicketResponseDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private Long userId;
    private String userName;
    private String category;
    private String description;
    private String priority;
    private String status;
    private Long assignedToId;
    private String assignedToName;
    private String resolutionNotes;
    private String rejectionReason;
    private String preferredContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AttachmentDTO> attachments;

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getPreferredContact() {
        return preferredContact;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AttachmentDTO> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentDTO> attachments) {
        this.attachments = attachments;
    }

    public static TicketResponseDTO fromEntity(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        if (ticket.getResource() != null) {
            dto.setResourceId(ticket.getResource().getId());
            dto.setResourceName(ticket.getResource().getName());
        }
        if (ticket.getUser() != null) {
            dto.setUserId(ticket.getUser().getId());
            dto.setUserName(ticket.getUser().getName());
        }
        dto.setCategory(ticket.getCategory() != null ? ticket.getCategory().name() : null);
        dto.setDescription(ticket.getDescription());
        dto.setPriority(ticket.getPriority() != null ? ticket.getPriority().name() : null);
        dto.setStatus(ticket.getStatus() != null ? ticket.getStatus().name() : null);
        if (ticket.getAssignedTo() != null) {
            dto.setAssignedToId(ticket.getAssignedTo().getId());
            dto.setAssignedToName(ticket.getAssignedTo().getName());
        }
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setPreferredContact(ticket.getPreferredContact());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }
}
