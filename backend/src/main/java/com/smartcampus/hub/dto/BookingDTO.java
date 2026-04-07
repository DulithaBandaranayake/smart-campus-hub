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
public class BookingDTO {
    private Long id;
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    private String resourceName;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    private String purpose;
    
    private String status;
    private String rejectionReason;
}
