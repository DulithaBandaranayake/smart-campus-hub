package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.TicketDTO;
import com.smartcampus.hub.dto.CommentDTO;
import com.smartcampus.hub.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@jakarta.validation.Valid @RequestBody TicketDTO ticketDTO) {
        return ResponseEntity.ok(ticketService.createTicket(ticketDTO));
    }

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketDTO> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketDTO> assignTechnician(@PathVariable Long id, @RequestParam String technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
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
