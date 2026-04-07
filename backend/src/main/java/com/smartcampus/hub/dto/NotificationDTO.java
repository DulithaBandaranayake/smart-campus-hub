package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String userId;
    private String message;
    private String title;
    private String priority;
    private boolean global;
    private String type;
    private boolean read;
    private LocalDateTime createdAt;
}
