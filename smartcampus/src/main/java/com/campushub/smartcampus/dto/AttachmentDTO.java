package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.TicketAttachment;

import java.time.LocalDateTime;

public class AttachmentDTO {

    private Long id;
    private String fileName;
    private String url;
    private String contentType;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static AttachmentDTO fromEntity(TicketAttachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setUrl("/uploads/" + attachment.getFilePath());
        dto.setContentType(attachment.getContentType());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }
}
