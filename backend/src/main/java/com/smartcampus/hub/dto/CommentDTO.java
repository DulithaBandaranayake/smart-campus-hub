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
public class CommentDTO {
    private Long id;
    
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;
    
    @NotBlank(message = "Author ID is required")
    private String authorId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private LocalDateTime createdAt;
}
