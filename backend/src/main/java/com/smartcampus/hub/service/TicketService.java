package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.CommentDTO;
import com.smartcampus.hub.dto.TicketDTO;
import com.smartcampus.hub.model.Comment;
import com.smartcampus.hub.model.Ticket;
import com.smartcampus.hub.repository.CommentRepository;
import com.smartcampus.hub.repository.TicketRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    public TicketDTO createTicket(TicketDTO ticketDTO) {
        if (ticketDTO.getSubject() == null || ticketDTO.getSubject().isBlank()) {
            throw new IllegalArgumentException("Subject is required");
        }
        if (ticketDTO.getCategory() == null || ticketDTO.getCategory().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }
        
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
        ticket.setPreferredContact(ticketDTO.getPreferredContact());
        ticket.setImage1(ticketDTO.getImage1());
        ticket.setImage2(ticketDTO.getImage2());
        ticket.setImage3(ticketDTO.getImage3());
        ticket.setStatus("OPEN");
        
        Ticket saved = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            "admin",
            "New ticket created: " + ticket.getSubject(),
            "TICKET"
        );
        
        return mapToTicketDTO(saved);
    }

    public List<TicketDTO> getAllTickets(String status) {
        if (status != null && !status.isEmpty()) {
            return ticketRepository.findAll().stream()
                    .filter(t -> status.equals(t.getStatus()))
                    .map(this::mapToTicketDTO)
                    .toList();
        }
        return ticketRepository.findAll().stream()
                .map(this::mapToTicketDTO)
                .toList();
    }

    public List<TicketDTO> getMyTickets(String reporterId) {
        return ticketRepository.findAll().stream()
                .filter(t -> reporterId.equals(t.getReporterId()))
                .map(this::mapToTicketDTO)
                .toList();
    }

    public TicketDTO updateTicketStatus(Long id, String status, String resolutionNotes) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        
        Ticket updated = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            ticket.getReporterId(),
            "Your ticket #" + ticket.getId() + " status updated to " + status,
            "TICKET"
        );
        
        return mapToTicketDTO(updated);
    }

    public TicketDTO assignTechnician(Long id, String technicianId) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setAssigneeId(technicianId);
        ticket.setStatus("IN_PROGRESS");
        
        Ticket updated = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            technicianId,
            "You have been assigned to ticket #" + ticket.getId(),
            "TICKET"
        );
        
        return mapToTicketDTO(updated);
    }

    public TicketDTO addResolutionNotes(Long id, String resolutionNotes) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setResolutionNotes(resolutionNotes);
        ticket.setStatus("RESOLVED");
        
        Ticket updated = ticketRepository.save(ticket);
        
        notificationService.createNotification(
            ticket.getReporterId(),
            "Your ticket #" + ticket.getId() + " has been resolved",
            "TICKET"
        );
        
        return mapToTicketDTO(updated);
    }

    public CommentDTO addComment(Long ticketId, CommentDTO commentDTO) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthorId(commentDTO.getAuthorId() != null ? commentDTO.getAuthorId() : "SYSTEM");
        comment.setContent(commentDTO.getContent() != null ? commentDTO.getContent() : "No content");
        comment.setCreatedAt(LocalDateTime.now());
                
        Comment saved = commentRepository.save(comment);
        
        return mapToCommentDTO(saved);
    }

    public List<CommentDTO> getComments(Long ticketId) {
        if (ticketId == null) return List.of();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicket(ticket).stream()
                .map(this::mapToCommentDTO)
                .toList();
    }

    private TicketDTO mapToTicketDTO(Ticket ticket) {
        return new TicketDTO(
                ticket.getId(),
                ticket.getResource() != null ? ticket.getResource().getId() : null,
                ticket.getResource() != null ? ticket.getResource().getName() : null,
                ticket.getLocation(),
                ticket.getReporterId(),
                ticket.getAssigneeId(),
                ticket.getPreferredContact(),
                ticket.getSubject(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getImage1(),
                ticket.getImage2(),
                ticket.getImage3(),
                ticket.getResolutionNotes(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    private CommentDTO mapToCommentDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getTicket().getId(),
                comment.getAuthorId(),
                null,
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}

