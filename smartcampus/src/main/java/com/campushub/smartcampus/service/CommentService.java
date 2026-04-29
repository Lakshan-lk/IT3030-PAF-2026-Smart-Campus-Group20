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

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(dto.getContent());
        comment.setIsInternal(dto.getIsInternal() != null ? dto.getIsInternal() : false);
        Comment saved = commentRepository.save(comment);
        
        // Send notification to ticket owner
        Long ticketOwnerId = ticket.getUser().getId();
        boolean isCommenterAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        notificationService.createCommentNotificationAsync(user.getId(), user.getName(), ticketId, ticketOwnerId, isCommenterAdmin);
        
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
        
        boolean isOwner = comment.getUser().getId().equals(dto.getUserId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requestingUser.getRole());
        
        // Admin can only edit their OWN comments, not user's comments  
        if (isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin cannot edit user's comments");
        }
        
        // Only owner can edit their own comment
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the comment owner can edit this comment");
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

        boolean isOwner = comment.getUser().getId().equals(requestingUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requestingUser.getRole());
        
        // Admin can only delete their OWN comments, not user's comments
        if (isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin cannot delete user's comments");
        }
        
        // Only owner can delete their own comment
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the comment owner can delete this comment");
        }

        commentRepository.delete(comment);
    }
}
