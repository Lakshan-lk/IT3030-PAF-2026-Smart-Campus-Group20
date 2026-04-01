package com.smartcampus.controllers;

import com.smartcampus.exceptions.ResourceNotFoundException;
import com.smartcampus.models.entities.Notification;
import com.smartcampus.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        return ResponseEntity.ok(notification);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@Validated @RequestBody Notification notification) {
        Notification createdNotification = notificationService.createNotification(notification);
        return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable Long id, @Validated @RequestBody Notification notificationDetails) {
        if (notificationService.getNotificationById(id).isEmpty()) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        Notification updatedNotification = notificationService.updateNotification(id, notificationDetails);
        return ResponseEntity.ok(updatedNotification);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        if (notificationService.getNotificationById(id).isEmpty()) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
