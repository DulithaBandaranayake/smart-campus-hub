package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentGrade;
    private LocalDate date;
    private String status;
    private String note;
}
