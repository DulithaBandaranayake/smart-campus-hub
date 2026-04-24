package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.NotificationDTO;
import com.smartcampus.hub.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<NotificationDTO>> getPublicNotices(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(notificationService.getPublicNotices(query, priority));
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotice(@RequestBody NotificationDTO dto) {
        // In a real app, we'd use @PreAuthorize("hasRole('ADMIN')")
        return ResponseEntity.ok(notificationService.createGlobalNotification(
                dto.getTitle(), dto.getMessage(), dto.getPriority()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationDTO> updateNotice(@PathVariable Long id, @RequestBody NotificationDTO dto) {
        return ResponseEntity.ok(notificationService.updateNotification(
                id, dto.getTitle(), dto.getMessage(), dto.getPriority()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
