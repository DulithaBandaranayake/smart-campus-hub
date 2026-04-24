package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MarkDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Double score;
    private Double maxScore;
    private String examType;
    private String semester;
    private String remarks;
    private LocalDateTime recordedAt;
}
