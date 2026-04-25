package com.smartcampus.hub.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String password;
    private String name;
    private String role;
    private String googleId;
    private String profilePicture;
    private String preferredContact;
    private boolean enabled;
    private LocalDateTime createdAt;
    
    // Student fields
    private String grade;
    private LocalDate enrollmentDate;
    private Long studentId;
    
    // Parent fields
    private Long parentId;
    private String phoneNumber;
    private String address;
    private java.util.List<Long> studentIds;
    
    // Lecturer fields
    private Long lecturerId;
    private String department;
    private String employeeId;
}
