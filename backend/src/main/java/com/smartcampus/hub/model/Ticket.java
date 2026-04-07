package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = true)
    private Resource resource; // Can be null if it's a general location incident

    @Column(nullable = false)
    private String subject;

    private String location;

    @Column(nullable = false)
    private String reporterId;

    private String assigneeId; // Technician ID

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
