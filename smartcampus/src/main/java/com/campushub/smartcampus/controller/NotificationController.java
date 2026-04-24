package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.NotificationResponseDTO;
import com.campushub.smartcampus.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/debug/all")
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications() {
        try {
            log.info("Debug: Getting all notifications");
            List<NotificationResponseDTO> all = notificationService.getAllNotifications();
            log.info("Found {} notifications", all.size());
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            log.error("Error getting all notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/debug/create")
    public ResponseEntity<NotificationResponseDTO> createTestNotification(@RequestParam Long userId) {
        try {
            log.info("Debug: Creating test notification for userId: {}", userId);
            return ResponseEntity.ok(notificationService.createTestNotification(userId));
        } catch (Exception e) {
            log.error("Error creating test notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/debug/test-comment")
    public ResponseEntity<String> testCommentNotification(@RequestParam Long commenterId, @RequestParam String commenterName, 
            @RequestParam Long ticketId, @RequestParam Long ticketOwnerId, @RequestParam boolean commenterIsAdmin) {
        try {
            log.info("Debug: Testing comment notification");
            notificationService.createCommentNotificationAsync(commenterId, commenterName, ticketId, ticketOwnerId, commenterIsAdmin);
            return ResponseEntity.ok("Comment notification triggered - check server logs");
        } catch (Exception e) {
            log.error("Error testing comment notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotifications(@RequestParam(required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.ok(notificationService.getAllNotifications());
            }
            return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
        } catch (Exception e) {
            log.error("Error getting notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications(@RequestParam(required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(notificationService.getUnreadNotificationsByUserId(userId));
        } catch (Exception e) {
            log.error("Error getting unread notifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam(required = false) Long userId) {
        try {
            if (userId == null) {
                return ResponseEntity.ok(0L);
            }
            return ResponseEntity.ok(notificationService.getUnreadCount(userId));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleError(Exception e) {
        log.error("Notification error: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError().body(e.getMessage());
    }
}