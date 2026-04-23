package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.NotificationResponseDTO;
import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Notification;
import com.campushub.smartcampus.entity.Ticket;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.NotificationType;
import com.campushub.smartcampus.repository.NotificationRepository;
import com.campushub.smartcampus.repository.UserRepository;
import com.campushub.smartcampus.repository.BookingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService self;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, 
                         BookingRepository bookingRepository, @Lazy NotificationService self) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.self = self;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .map(NotificationResponseDTO::fromEntity)
                .toList();
    }

    public NotificationResponseDTO createTestNotification(Long userId) {
        log.info("Creating test notification for userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        Notification notification = new Notification();
        notification.setType(NotificationType.TICKET_CREATED);
        notification.setMessage("Test notification for user: " + user.getName());
        notification.setUser(user);
        notification.setReferenceId(1L);
        
        Notification saved = notificationRepository.save(notification);
        log.info("Test notification created with id: {}", saved.getId());
        return NotificationResponseDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponseDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
        return NotificationResponseDTO.fromEntity(notification);
    }

    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    public NotificationResponseDTO createTicketCreatedNotification(Ticket ticket) {
        log.info("Creating ticket created notification for ticket: {} by user: {}", ticket.getId(), ticket.getUser().getId());
        
        try {
            List<User> allUsers = userRepository.findAll();
            List<User> admins = allUsers.stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .toList();
            
            log.info("Found {} admins total", admins.size());

            if (admins.isEmpty()) {
                log.warn("No admin found - creating notification for first user withADMIN role");
                // Try finding by email
                admins = allUsers.stream()
                    .filter(u -> u.getEmail() != null && u.getEmail().contains("admin"))
                    .toList();
            }

            if (admins.isEmpty()) {
                log.error("NO ADMIN FOUND! Using first user in system as fallback");
                if (!allUsers.isEmpty()) {
                    admins = List.of(allUsers.get(0));
                }
            }
            
            // Send to ALL admins
            String userName = ticket.getUser().getName() != null ? ticket.getUser().getName() : ticket.getUser().getEmail();
            String message = userName + " raised a new ticket (#" + ticket.getId() + ")";
            log.info("Creating notification: {}", message);
            
            for (User admin : admins) {
                Notification notification = new Notification();
                notification.setType(NotificationType.TICKET_CREATED);
                notification.setMessage(message);
                notification.setUser(admin);
                notification.setReferenceId(ticket.getId());
                Notification saved = notificationRepository.save(notification);
                log.info("Notification {} saved for admin {}", saved.getId(), admin.getId());
            }
            
            return admins.isEmpty() ? null : NotificationResponseDTO.fromEntity(
                notificationRepository.findAll().get(notificationRepository.findAll().size() - 1)
            );
            
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage(), e);
            return null;
        }
    }

    public NotificationResponseDTO createTicketAssignedNotification(Ticket ticket, User technician) {
        log.info("Creating ticket assigned notification for ticket: {} to technician: {}", ticket.getId(), technician.getId());
        
        User ticketOwner = ticket.getUser();
        String techName = technician.getName() != null ? technician.getName() : technician.getEmail();
        String message = "Technician " + techName + " has been assigned to your ticket (#" + ticket.getId() + ")";
        log.info("Notification message: {}", message);

        Notification notification = new Notification();
        notification.setType(NotificationType.TICKET_ASSIGNED);
        notification.setMessage(message);
        notification.setUser(ticketOwner);
        notification.setReferenceId(ticket.getId());

        Notification saved = notificationRepository.save(notification);
        log.info("Notification saved with id: {}", saved.getId());
        return NotificationResponseDTO.fromEntity(saved);
    }

    public NotificationResponseDTO createTicketRejectedNotification(Ticket ticket) {
        log.info("Creating ticket rejected notification for ticket: {}", ticket.getId());
        
        User ticketOwner = ticket.getUser();
        String message = "Your ticket (#" + ticket.getId() + ") has been rejected. Reason: " + ticket.getRejectionReason();

        Notification notification = new Notification();
        notification.setType(NotificationType.TICKET_REJECTED);
        notification.setMessage(message);
        notification.setUser(ticketOwner);
        notification.setReferenceId(ticket.getId());

        Notification saved = notificationRepository.save(notification);
        return NotificationResponseDTO.fromEntity(saved);
    }

    public NotificationResponseDTO createTicketResolvedNotification(Ticket ticket) {
        log.info("Creating ticket resolved notification for ticket: {}", ticket.getId());
        
        User ticketOwner = ticket.getUser();
        String message = "Your ticket (#" + ticket.getId() + ") has been resolved";

        Notification notification = new Notification();
        notification.setType(NotificationType.TICKET_RESOLVED);
        notification.setMessage(message);
        notification.setUser(ticketOwner);
        notification.setReferenceId(ticket.getId());

        Notification saved = notificationRepository.save(notification);
        return NotificationResponseDTO.fromEntity(saved);
    }

    public NotificationResponseDTO createTicketClosedNotification(Ticket ticket) {
        log.info("Creating ticket closed notification for ticket: {}", ticket.getId());
        
        User ticketOwner = ticket.getUser();
        String message = "Your ticket (#" + ticket.getId() + ") has been closed";

        Notification notification = new Notification();
        notification.setType(NotificationType.TICKET_CLOSED);
        notification.setMessage(message);
        notification.setUser(ticketOwner);
        notification.setReferenceId(ticket.getId());

        Notification saved = notificationRepository.save(notification);
        return NotificationResponseDTO.fromEntity(saved);
    }

    // ============ BOOKING NOTIFICATIONS ============

    // Async wrapper - called from other services (ensures @Async works via proxy)
    @Async
    public void createBookingCreatedNotificationAsync(Booking booking) {
        log.info("=== Booking notification ASYNC for booking: {} ===", booking.getId());
        
        try {
            Long bookingId = booking.getId();
            
            // Fetch fresh booking from DB to avoid lazy loading issues
            Booking freshBooking = bookingRepository.findById(bookingId).orElse(null);
            if (freshBooking == null) {
                log.error("Booking not found: {}", bookingId);
                return;
            }
            
            // Load user eagerly
            User bookingUser = freshBooking.getUser();
            if (bookingUser == null) {
                log.error("Booking user is null for booking: {}", bookingId);
                return;
            }
            
            log.info("Fetching all users...");
            List<User> allUsers = userRepository.findAll();
            log.info("Found {} users", allUsers.size());
            
            // Find admin
            User admin = null;
            for (User u : allUsers) {
                log.info("User: id={}, name={}, role={}", u.getId(), u.getName(), u.getRole());
                if ("ADMIN".equalsIgnoreCase(u.getRole())) {
                    admin = u;
                    break;
                }
            }
            
            if (admin == null && !allUsers.isEmpty()) {
                admin = allUsers.get(0);
                log.info("Using first user as admin fallback: {}", admin.getId());
            }
            
            if (admin != null) {
                String userName = bookingUser.getName() != null ? bookingUser.getName() : bookingUser.getEmail();
                String message = userName + " made a new booking (#" + bookingId + ")";
                
                Notification notification = new Notification();
                notification.setType(NotificationType.BOOKING_CREATED);
                notification.setMessage(message);
                notification.setUser(admin);
                notification.setReferenceId(bookingId);
                
                notificationRepository.save(notification);
                log.info("SUCCESS: Notification saved with id: {}", notification.getId());
            } else {
                log.error("FAILED: No admin found!");
            }
        } catch (Exception e) {
            log.error("FAILED: Exception: {} - {}", e.getMessage(), e);
        }
    }

    @Async
    public void createBookingApprovedNotificationAsync(Booking booking) {
        log.info("Creating booking approved notification ASYNC for booking: {}", booking.getId());
        
        try {
            Long bookingId = booking.getId();
            
            // Fetch fresh data
            Booking freshBooking = bookingRepository.findById(bookingId).orElse(null);
            if (freshBooking == null) {
                log.error("Booking not found: {}", bookingId);
                return;
            }
            
            User bookingOwner = freshBooking.getUser();
            String resourceName = freshBooking.getResource() != null ? freshBooking.getResource().getName() : "Resource";
            
            String message = "Your booking (#" + bookingId + ") for " + resourceName + " has been APPROVED";

            Notification notification = new Notification();
            notification.setType(NotificationType.BOOKING_APPROVED);
            notification.setMessage(message);
            notification.setUser(bookingOwner);
            notification.setReferenceId(bookingId);

            notificationRepository.save(notification);
            log.info("Booking approved notification saved");
        } catch (Exception e) {
            log.error("Error creating booking approved notification: {}", e.getMessage());
        }
    }

    @Async
    public void createBookingRejectedNotificationAsync(Booking booking, String reason) {
        log.info("Creating booking rejected notification ASYNC for booking: {}", booking.getId());
        
        try {
            Long bookingId = booking.getId();
            
            // Fetch fresh data
            Booking freshBooking = bookingRepository.findById(bookingId).orElse(null);
            if (freshBooking == null) {
                log.error("Booking not found: {}", bookingId);
                return;
            }
            
            User bookingOwner = freshBooking.getUser();
            String resourceName = freshBooking.getResource() != null ? freshBooking.getResource().getName() : "Resource";
            
            String message = "Your booking (#" + bookingId + ") for " + resourceName + " has been REJECTED. Reason: " + reason;

            Notification notification = new Notification();
            notification.setType(NotificationType.BOOKING_REJECTED);
            notification.setMessage(message);
            notification.setUser(bookingOwner);
            notification.setReferenceId(bookingId);

            notificationRepository.save(notification);
            log.info("Booking rejected notification saved");
        } catch (Exception e) {
            log.error("Error creating booking rejected notification: {}", e.getMessage());
        }
    }
    
    // ============ COMMENT NOTIFICATIONS ============
    
    @Async
    public void createCommentNotificationAsync(Long commenterId, String commenterName, Long ticketId, Long ticketOwnerId, boolean commenterIsAdmin) {
        log.info("Creating comment notification: {} commented on ticket {}", commenterName, ticketId);
        
        try {
            if (ticketOwnerId == null) {
                log.error("Ticket owner ID is null");
                return;
            }
            
            User ticketOwner = userRepository.findById(ticketOwnerId).orElse(null);
            if (ticketOwner == null) {
                log.error("Ticket owner not found: {}", ticketOwnerId);
                return;
            }
            
            // Don't notify if commenting on own ticket
            if (commenterId != null && commenterId.equals(ticketOwnerId)) {
                log.info("User commenting on their own ticket, skipping notification");
                return;
            }
            
            String message;
            if (commenterIsAdmin) {
                message = "Admin " + commenterName + " commented on your ticket";
            } else {
                message = commenterName + " commented on your ticket";
            }
            
            Notification notification = new Notification();
            notification.setType(NotificationType.COMMENT_ADDED);
            notification.setMessage(message);
            notification.setUser(ticketOwner);
            notification.setReferenceId(ticketId);
            
            notificationRepository.save(notification);
            log.info("Comment notification saved for user {}", ticketOwnerId);
        } catch (Exception e) {
            log.error("Error creating comment notification: {}", e.getMessage());
        }
    }
}