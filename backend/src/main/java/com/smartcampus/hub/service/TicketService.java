package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Comment;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    @Autowired
    private com.smartcampus.hub.repository.TicketRepository ticketRepository;

    @Autowired
    private com.smartcampus.hub.repository.CommentRepository commentRepository;

    @Autowired
    private com.smartcampus.hub.repository.ResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    public com.smartcampus.hub.dto.TicketDTO createTicket(com.smartcampus.hub.dto.TicketDTO ticketDTO) {
        Ticket ticket = new Ticket();
        
        if (ticketDTO.getResourceId() != null) {
            ticket.setResource(resourceRepository.findById(ticketDTO.getResourceId()).orElse(null));
        }

        ticket.setReporterId(ticketDTO.getReporterId());
        ticket.setSubject(ticketDTO.getSubject());
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setLocation(ticketDTO.getLocation());
        ticket.setPriority(ticketDTO.getPriority() != null ? ticketDTO.getPriority() : "MEDIUM");
        ticket.setCategory(ticketDTO.getCategory());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(java.time.LocalDateTime.now());
        
        Ticket saved = ticketRepository.save(ticket);
        return mapToTicketDTO(saved);
    }

    public List<com.smartcampus.hub.dto.TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToTicketDTO)
                .toList();
    }

    public com.smartcampus.hub.dto.TicketDTO updateTicketStatus(Long id, String status) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        
        notificationService.createNotification(
            ticket.getReporterId(),
            "Your ticket #" + ticket.getId() + " status updated to " + status,
            "TICKET"
        );
        
        Ticket updated = ticketRepository.save(ticket);
        return mapToTicketDTO(updated);
    }

    public com.smartcampus.hub.dto.TicketDTO assignTechnician(Long id, String technicianId) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssigneeId(technicianId);
        ticket.setStatus("IN_PROGRESS");
        Ticket updated = ticketRepository.save(ticket);
        return mapToTicketDTO(updated);
    }

    public com.smartcampus.hub.dto.CommentDTO addComment(Long ticketId, com.smartcampus.hub.dto.CommentDTO commentDTO) {
        if (ticketId == null) throw new IllegalArgumentException("Ticket ID cannot be null");
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthorId(commentDTO.getAuthorId());
        comment.setContent(commentDTO.getContent());
        comment.setCreatedAt(java.time.LocalDateTime.now());
                
        // Notify reporter if someone else comments
        if (!comment.getAuthorId().equals(ticket.getReporterId())) {
            notificationService.createNotification(
                ticket.getReporterId(),
                "New comment on your ticket #" + ticket.getId(),
                "COMMENT"
            );
        }
        
        Comment saved = commentRepository.save(comment);
        return mapToCommentDTO(saved);
    }

    public List<com.smartcampus.hub.dto.CommentDTO> getComments(Long ticketId) {
        if (ticketId == null) return List.of();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicket(ticket).stream()
                .map(this::mapToCommentDTO)
                .toList();
    }

    private com.smartcampus.hub.dto.TicketDTO mapToTicketDTO(Ticket ticket) {
        return new com.smartcampus.hub.dto.TicketDTO(
                ticket.getId(),
                ticket.getResource() != null ? ticket.getResource().getId() : null,
                ticket.getResource() != null ? ticket.getResource().getName() : null,
                ticket.getLocation(),
                ticket.getReporterId(),
                ticket.getAssigneeId(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getCreatedAt()
        );
    }

    private com.smartcampus.hub.dto.CommentDTO mapToCommentDTO(Comment comment) {
        return new com.smartcampus.hub.dto.CommentDTO(
                comment.getId(),
                comment.getTicket().getId(),
                comment.getAuthorId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}

