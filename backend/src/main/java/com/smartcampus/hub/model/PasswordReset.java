package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_resets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordReset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private boolean approved = false;

    private String approvedBy;

    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
    }
}