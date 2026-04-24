package com.smartcampus.hub.dto;

import lombok.Data;

@Data
public class SubjectDto {
    private Long id;
    private String name;
    private String code;
    private String gradeLevel;
    private Long lecturerId;
    private String lecturerName;
    private String description;
}
