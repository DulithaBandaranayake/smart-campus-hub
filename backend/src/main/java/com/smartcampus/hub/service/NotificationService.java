package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.NotificationDTO;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public NotificationDTO createNotification(String userId, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setPriority("INFO");
        notification.setGlobal(false);
        notification.setCreatedAt(java.time.LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    public NotificationDTO createGlobalNotification(String title, String message, String priority) {
        Notification notification = new Notification();
        notification.setUserId("SYSTEM");
        notification.setTitle(title != null ? title : "Notification");
        notification.setMessage(message != null ? message : "No content provided");
        notification.setPriority(priority != null ? priority.toUpperCase() : "INFO");
        notification.setGlobal(true);
        notification.setRead(false);
        notification.setType("NOTICE");
        notification.setCreatedAt(java.time.LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    public NotificationDTO updateNotification(Long id, String title, String message, String priority) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        if (title != null) notification.setTitle(title);
        if (message != null) notification.setMessage(message);
        if (priority != null) notification.setPriority(priority.toUpperCase());
        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    public List<NotificationDTO> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<NotificationDTO> getPublicNotices(String query, String priority) {
        List<Notification> notices;
        
        if (query != null && !query.isEmpty()) {
            String lowerQuery = query.toLowerCase();
            if (lowerQuery.contains("today")) {
                // Today logic - simplicity: filtering results in memory for keywords if needed or custom query
                notices = notificationRepository.findByGlobalTrueOrderByCreatedAtDesc().stream()
                        .filter(n -> n.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now()))
                        .toList();
            } else if (lowerQuery.contains("yesterday")) {
                notices = notificationRepository.findByGlobalTrueOrderByCreatedAtDesc().stream()
                        .filter(n -> n.getCreatedAt().toLocalDate().equals(java.time.LocalDate.now().minusDays(1)))
                        .toList();
            } else {
                notices = notificationRepository.searchPublicNotices(query);
            }
        } else if (priority != null && !priority.isEmpty() && !priority.equalsIgnoreCase("ALL")) {
            notices = notificationRepository.findByGlobalTrueAndPriorityOrderByCreatedAtDesc(priority.toUpperCase());
        } else {
            notices = notificationRepository.findByGlobalTrueOrderByCreatedAtDesc();
        }

        return notices.stream().map(this::mapToDTO).toList();
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getUserId(),
                notification.getMessage(),
                notification.getTitle(),
                notification.getPriority(),
                notification.isGlobal(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public void markAsRead(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public Long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void deleteNotification(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        notificationRepository.deleteById(id);
    }
}
