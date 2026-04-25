package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String grade;
    private String enrollmentDate;
    private Long parentId;
    private String parentName;
}