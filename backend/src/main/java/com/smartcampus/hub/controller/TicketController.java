package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.TicketDTO;
import com.smartcampus.hub.dto.CommentDTO;
import com.smartcampus.hub.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@jakarta.validation.Valid @RequestBody TicketDTO ticketDTO) {
        return ResponseEntity.ok(ticketService.createTicket(ticketDTO));
    }

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ticketService.getAllTickets(status));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDTO>> getMyTickets(@RequestParam String reporterId) {
        return ResponseEntity.ok(ticketService.getMyTickets(reporterId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNotes) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, resolutionNotes));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketDTO> assignTechnician(@PathVariable Long id, @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketDTO> addResolutionNotes(@PathVariable Long id, @RequestParam String resolutionNotes) {
        return ResponseEntity.ok(ticketService.addResolutionNotes(id, resolutionNotes));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id, @jakarta.validation.Valid @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(ticketService.addComment(id, commentDTO));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }
}
