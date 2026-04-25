package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@jakarta.validation.Valid @RequestBody BookingDTO booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<BookingDTO>> getAllBookings(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@RequestParam String userId) {
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Long id, 
            @RequestParam String status, 
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok().build();
    }
}
