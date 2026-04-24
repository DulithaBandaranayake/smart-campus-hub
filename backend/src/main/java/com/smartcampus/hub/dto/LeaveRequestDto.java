package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeaveRequestDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentGrade;
    private Long parentId;
    private String parentName;
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String parentComment;
    private String adminComment;
    private LocalDateTime createdAt;
    private LocalDateTime parentReviewedAt;
    private LocalDateTime adminReviewedAt;
}
