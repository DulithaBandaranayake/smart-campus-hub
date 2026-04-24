package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String password;
    private String name;
    private String role;
    
    // Student fields
    private String grade;
    private LocalDate enrollmentDate;
    private Long studentId; // Student entity ID
    
    // Parent fields
    private Long parentId;  // Parent entity ID
    private String phoneNumber;
    private String address;
    private java.util.List<Long> studentIds; // IDs of children students
    
    // Lecturer fields
    private Long lecturerId; // Lecturer entity ID
    private String department;
    private String employeeId;
}
