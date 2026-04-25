package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String phoneNumber;
    private String address;
}