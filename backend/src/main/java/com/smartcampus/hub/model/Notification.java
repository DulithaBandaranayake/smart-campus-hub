package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String message;

    @Column(name = "title", nullable = true)
    private String title;

    @Column(name = "priority", nullable = true)
    private String priority; // URGENT, EVENT, INFO

    @Column(name = "is_global", columnDefinition = "boolean default false")
    private boolean global = false;

    private String type; // BOOKING, TICKET, COMMENT, NOTICE

    @Column(name = "is_read", columnDefinition = "boolean default false")
    private boolean read = false;


    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
