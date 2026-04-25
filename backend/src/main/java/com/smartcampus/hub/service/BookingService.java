package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private NotificationService notificationService;

    public BookingDTO createBooking(BookingDTO bookingDTO) {
        if (bookingDTO.getResourceId() == null) throw new IllegalArgumentException("Resource ID cannot be null");
        if (bookingDTO.getStartTime().isAfter(bookingDTO.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        Long resourceId = bookingDTO.getResourceId();
        Resource resource = resourceRepository.findById(java.util.Objects.requireNonNull(resourceId))
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (!"ACTIVE".equals(resource.getStatus())) {
            throw new IllegalArgumentException("Resource is not available for booking");
        }

        List<Booking> conflicts = bookingRepository.findByResourceAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                resource, "APPROVED", bookingDTO.getEndTime(), bookingDTO.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking conflict detected for the selected time range.");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUserId(bookingDTO.getUserId());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        booking.setPurpose(bookingDTO.getPurpose());
        booking.setExpectedAttendees(bookingDTO.getExpectedAttendees());
        booking.setStatus("PENDING");
        
        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
            "admin",
            "New booking request for " + resource.getName(),
            "BOOKING"
        );
        
        return mapToDTO(saved);
    }

    public List<BookingDTO> getAllBookings(String status) {
        if (status != null && !status.isEmpty()) {
            return bookingRepository.findAll().stream()
                    .filter(b -> status.equals(b.getStatus()))
                    .map(this::mapToDTO)
                    .toList();
        }
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<BookingDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    public BookingDTO updateBookingStatus(Long id, String status, String rejectionReason) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        booking.setStatus(status);
        if ("REJECTED".equals(status)) {
            booking.setRejectionReason(rejectionReason);
        }
        
        Booking updated = bookingRepository.save(booking);
        
        notificationService.createNotification(
            booking.getUserId(),
            "Your booking for " + booking.getResource().getName() + " has been " + status,
            "BOOKING"
        );
        
        return mapToDTO(updated);
    }

    public void deleteBooking(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        bookingRepository.deleteById(id);
    }

    private BookingDTO mapToDTO(Booking booking) {
        return new BookingDTO(
                booking.getId(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getUserId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getStatus(),
                booking.getRejectionReason(),
                booking.getExpectedAttendees()
        );
    }
}
