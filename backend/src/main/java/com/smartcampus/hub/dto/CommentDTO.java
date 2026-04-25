package com.smartcampus.hub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private Long ticketId;
    private String authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}