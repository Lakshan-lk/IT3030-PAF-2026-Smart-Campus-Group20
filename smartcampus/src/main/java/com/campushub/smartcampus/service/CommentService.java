package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.CommentDTO;
import com.campushub.smartcampus.dto.CommentRequestDTO;
import com.campushub.smartcampus.entity.Comment;
import com.campushub.smartcampus.entity.Ticket;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.repository.CommentRepository;
import com.campushub.smartcampus.repository.TicketRepository;
import com.campushub.smartcampus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, 
                       UserRepository userRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<CommentDTO> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentDTO::fromEntity)
                .toList();
    }

    public CommentDTO addComment(Long ticketId, CommentRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + ticketId));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        if (isAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins can only view ticket discussions");
        }
        boolean isStaff = isStaff(user);
        boolean requestedInternal = Boolean.TRUE.equals(dto.getIsInternal());

        if (requestedInternal && !isStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only technicians can post internal notes");
        }

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(dto.getContent());
        comment.setIsInternal(requestedInternal);
        Comment saved = commentRepository.save(comment);
        
        // --- IMPROVED NOTIFICATION LOGIC ---
        String commenterRole = (user.getRole() != null ? user.getRole() : "USER").toUpperCase();
        boolean isInternal = comment.getIsInternal();
        
        // 1. Notify Ticket Reporter (unless reporter is the one who commented)
        User reporter = ticket.getUser();
        if (reporter != null && !reporter.getId().equals(user.getId()) && !isInternal) {
            notificationService.createCommentNotificationAsync(user.getId(), user.getName(), ticketId, reporter.getId(), "ADMIN".equals(commenterRole));
        }
        
        // 2. Notify Assigned Technician (if any, and unless tech is the one who commented)
        User technician = ticket.getAssignedTo();
        if (technician != null && !technician.getId().equals(user.getId())) {
            notificationService.createCommentNotificationAsync(user.getId(), user.getName(), ticketId, technician.getId(), "ADMIN".equals(commenterRole));
        }
        
        // 3. Notify Admins (unless admin is the one who commented)
        if (!"ADMIN".equals(commenterRole)) {
            List<User> allAdmins = userRepository.findByRoleIn(List.of("ADMIN", "admin"));
            for (User admin : allAdmins) {
                if (!admin.getId().equals(user.getId())) {
                    notificationService.createCommentNotificationAsync(user.getId(), user.getName(), ticketId, admin.getId(), false);
                }
            }
        }
        
        return CommentDTO.fromEntity(saved);
    }

    public CommentDTO updateComment(Long ticketId, Long commentId, CommentRequestDTO dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to ticket " + ticketId);
        }
        
        User requestingUser = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        if (isAdmin(requestingUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins can only view ticket discussions");
        }
        
        boolean isOwner = comment.getUser().getId().equals(dto.getUserId());
        boolean isStaff = isStaff(requestingUser);

        // Owners can edit their own comment. Staff can moderate any comment on the ticket.
        if (!isOwner && !isStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the comment owner or staff can edit this comment");
        }

        comment.setContent(dto.getContent());
        return CommentDTO.fromEntity(commentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId, Long requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to ticket " + ticketId);
        }

        User requestingUser = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + requestingUserId));
        if (isAdmin(requestingUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins can only view ticket discussions");
        }

        boolean isOwner = comment.getUser().getId().equals(requestingUserId);
        boolean isStaff = isStaff(requestingUser);

        // Owners can delete their own comment. Staff can moderate any comment on the ticket.
        if (!isOwner && !isStaff) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the comment owner or staff can delete this comment");
        }

        commentRepository.delete(comment);
    }

    private boolean isStaff(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }

        String role = user.getRole().trim().toUpperCase();
        return "TECHNICIAN".equals(role);
    }

    private boolean isAdmin(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }

        return "ADMIN".equalsIgnoreCase(user.getRole().trim());
    }
}
