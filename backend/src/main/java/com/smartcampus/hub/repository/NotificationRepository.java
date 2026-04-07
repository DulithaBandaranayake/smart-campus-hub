package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    Long countByUserIdAndReadFalse(String userId);

    List<Notification> findByGlobalTrueOrderByCreatedAtDesc();

    // Search and Filter Queries
    List<Notification> findByGlobalTrueAndPriorityOrderByCreatedAtDesc(String priority);
    
    @org.springframework.data.jpa.repository.Query("SELECT n FROM Notification n WHERE n.global = true AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(n.message) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY n.createdAt DESC")
    List<Notification> searchPublicNotices(String query);

    List<Notification> findByGlobalTrueAndPriorityAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String priority, String title);
}
