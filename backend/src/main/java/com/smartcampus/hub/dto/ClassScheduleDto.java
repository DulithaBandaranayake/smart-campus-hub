package com.smartcampus.hub.dto;

import lombok.Data;

@Data
public class ClassScheduleDto {
    private Long id;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long lecturerId;
    private String lecturerName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
    private String semester;
    private String gradeLevel;
}
