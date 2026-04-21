package com.campushub.smartcampus.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequestDTO {

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }
}
