package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {
    private Long id;
    
    private Long resourceId;
    
    private String resourceName;
    private String location;
    
    @NotBlank(message = "Reporter ID is required")
    private String reporterId;
    
    private String assigneeId;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    private String description;
    private String status;
    
    @NotBlank(message = "Priority is required")
    private String priority;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private LocalDateTime createdAt;
}
