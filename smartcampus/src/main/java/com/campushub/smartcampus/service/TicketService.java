package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.AssignTicketRequestDTO;
import com.campushub.smartcampus.dto.StatusUpdateDTO;
import com.campushub.smartcampus.dto.TicketRequestDTO;
import com.campushub.smartcampus.dto.TicketResponseDTO;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.entity.Ticket;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.TicketCategory;
import com.campushub.smartcampus.enums.TicketPriority;
import com.campushub.smartcampus.enums.TicketStatus;
import com.campushub.smartcampus.repository.CommentRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import com.campushub.smartcampus.repository.TicketAttachmentRepository;
import com.campushub.smartcampus.repository.TicketRepository;
import com.campushub.smartcampus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
<<<<<<< HEAD
=======
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
>>>>>>> b531ae34a82aad084bace72ebdb3165ae7c0edea
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@Transactional
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         TicketAttachmentRepository ticketAttachmentRepository,
                         CommentRepository commentRepository,
                         ResourceRepository resourceRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.commentRepository = commentRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets(String status, String priority, String category, Long assignedTo, Long userId) {
        Stream<Ticket> stream = ticketRepository.findAll().stream();

        if (status != null && !status.isBlank()) {
            TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase(Locale.ROOT));
            stream = stream.filter(ticket -> ticket.getStatus() == ticketStatus);
        }
        if (priority != null && !priority.isBlank()) {
            TicketPriority ticketPriority = TicketPriority.valueOf(priority.toUpperCase(Locale.ROOT));
            stream = stream.filter(ticket -> ticket.getPriority() == ticketPriority);
        }
        if (category != null && !category.isBlank()) {
            TicketCategory ticketCategory = TicketCategory.valueOf(category.toUpperCase(Locale.ROOT));
            stream = stream.filter(ticket -> ticket.getCategory() == ticketCategory);
        }
        if (assignedTo != null) {
            stream = stream.filter(ticket -> ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), assignedTo));
        }
        if (userId != null) {
            stream = stream.filter(ticket -> ticket.getUser() != null && Objects.equals(ticket.getUser().getId(), userId));
        }

        return stream
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByUserId(Long userId) {
        return ticketRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));
        return toResponse(ticket);
    }

    public TicketResponseDTO createTicket(TicketRequestDTO dto) {
        log.info("Creating ticket with userId: {}", dto.getUserId());
        Ticket ticket = new Ticket();
        applyRequest(ticket, dto);
        ticket.setStatus(TicketStatus.OPEN);
        Ticket saved = ticketRepository.save(ticket);
        log.info("Ticket saved with id: {}, calling notification service", saved.getId());
        try {
            notificationService.createTicketCreatedNotification(saved);
            log.info("Notification created successfully");
        } catch (Exception e) {
            log.error("Failed to create notification: {}", e.getMessage(), e);
        }
        return toResponse(saved);
    }

    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new IllegalArgumentException("Only OPEN tickets can be updated");
        }

        applyRequest(ticket, dto);
        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    public TicketResponseDTO assignTicket(Long id, AssignTicketRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));
        User assignee = userRepository.findById(dto.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getAssigneeId()));

        if (!"TECHNICIAN".equalsIgnoreCase(assignee.getRole())) {
            throw new IllegalArgumentException("Assignee must have TECHNICIAN role");
        }
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalArgumentException("Closed or rejected tickets cannot be assigned");
        }

        ticket.setAssignedTo(assignee);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket saved = ticketRepository.save(ticket);
        notificationService.createTicketAssignedNotification(saved, assignee);
        return toResponse(saved);
    }

    public TicketResponseDTO updateStatus(Long id, StatusUpdateDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + id));

        TicketStatus nextStatus = TicketStatus.valueOf(dto.getStatus().toUpperCase(Locale.ROOT));
        validateTransition(ticket.getStatus(), nextStatus);
        validateStatusPayload(nextStatus, dto);
        validateAssignmentRequirement(ticket, nextStatus);

        ticket.setStatus(nextStatus);
        if (nextStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(dto.getReason());
        } else if (nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CLOSED || nextStatus == TicketStatus.IN_PROGRESS) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
            if (nextStatus != TicketStatus.REJECTED) {
                ticket.setRejectionReason(null);
            }
        }

        Ticket saved = ticketRepository.save(ticket);

        if (nextStatus == TicketStatus.REJECTED) {
            notificationService.createTicketRejectedNotification(saved);
        } else if (nextStatus == TicketStatus.RESOLVED) {
            notificationService.createTicketResolvedNotification(saved);
        } else if (nextStatus == TicketStatus.CLOSED) {
            notificationService.createTicketClosedNotification(saved);
        }

        return toResponse(saved);
    }

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new EntityNotFoundException("Ticket not found with id: " + id);
        }
        ticketAttachmentRepository.findByTicketId(id).forEach(ticketAttachmentRepository::delete);
        commentRepository.findByTicketIdOrderByCreatedAtAsc(id).forEach(commentRepository::delete);
        ticketRepository.deleteById(id);
    }

    private void applyRequest(Ticket ticket, TicketRequestDTO dto) {
        Resource resource = null;
        if (dto.getResourceId() != null) {
            resource = resourceRepository.findById(dto.getResourceId())
                    .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + dto.getResourceId()));
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));

        ticket.setResource(resource);
        ticket.setUser(user);
        ticket.setCategory(TicketCategory.valueOf(dto.getCategory().toUpperCase(Locale.ROOT)));
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(TicketPriority.valueOf(dto.getPriority().toUpperCase(Locale.ROOT)));
        ticket.setPreferredContact(dto.getPreferredContact());
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }
        switch (current) {
            case OPEN -> {
                if (next != TicketStatus.IN_PROGRESS && next != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("Invalid status transition from OPEN to " + next);
                }
            }
            case IN_PROGRESS -> {
                if (next != TicketStatus.RESOLVED && next != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("Invalid status transition from IN_PROGRESS to " + next);
                }
            }
            case RESOLVED -> {
                if (next != TicketStatus.CLOSED) {
                    throw new IllegalArgumentException("Invalid status transition from RESOLVED to " + next);
                }
            }
            case CLOSED, REJECTED -> throw new IllegalArgumentException("Closed or rejected tickets cannot change status");
        }
    }

    private void validateStatusPayload(TicketStatus nextStatus, StatusUpdateDTO dto) {
        if (nextStatus == TicketStatus.REJECTED && (dto.getReason() == null || dto.getReason().isBlank())) {
            throw new IllegalArgumentException("A rejection reason is required when rejecting a ticket");
        }
        if ((nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CLOSED)
                && (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank())) {
            throw new IllegalArgumentException("Resolution notes are required before resolving or closing a ticket");
        }
    }

    private void validateAssignmentRequirement(Ticket ticket, TicketStatus nextStatus) {
        if ((nextStatus == TicketStatus.IN_PROGRESS || nextStatus == TicketStatus.RESOLVED || nextStatus == TicketStatus.CLOSED)
                && ticket.getAssignedTo() == null) {
            throw new IllegalArgumentException("Assign a technician before moving the ticket to " + nextStatus);
        }
    }

    private TicketResponseDTO toResponse(Ticket ticket) {
        return TicketResponseDTO.fromEntity(ticket);
    }
}
