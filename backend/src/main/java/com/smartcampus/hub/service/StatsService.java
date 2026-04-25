package com.smartcampus.hub.service;

import com.smartcampus.hub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalTickets", ticketRepository.count());
        stats.put("pendingBookings", bookingRepository.findAll().stream()
            .filter(b -> b.getStatus().equals("PENDING")).count());
        stats.put("openTickets", ticketRepository.findAll().stream()
            .filter(t -> t.getStatus().equals("OPEN")).count());
        
        return stats;
    }

    public Map<String, Object> getWeeklyStats() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        stats.put("bookings", getBookingCounts(weekAgo));
        stats.put("tickets", getTicketCounts(weekAgo));
        stats.put("users", getUserCounts(weekAgo));
        
        return stats;
    }

    public Map<String, Object> getMonthlyStats() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        
        stats.put("bookings", getBookingCounts(monthAgo));
        stats.put("tickets", getTicketCounts(monthAgo));
        stats.put("users", getUserCounts(monthAgo));
        
        return stats;
    }

    private Map<String, Long> getBookingCounts(LocalDateTime since) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("mon", bookingRepository.findAll().stream()
            .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(since)).count());
        counts.put("tue", 0L);
        counts.put("wed", 0L);
        counts.put("thu", 0L);
        counts.put("fri", 0L);
        counts.put("sat", 0L);
        counts.put("sun", 0L);
        return counts;
    }

    private Map<String, Long> getTicketCounts(LocalDateTime since) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("mon", ticketRepository.findAll().stream()
            .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(since)).count());
        counts.put("tue", 0L);
        counts.put("wed", 0L);
        counts.put("thu", 0L);
        counts.put("fri", 0L);
        counts.put("sat", 0L);
        counts.put("sun", 0L);
        return counts;
    }

    private Map<String, Long> getUserCounts(LocalDateTime since) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("mon", userRepository.findAll().stream()
            .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(since)).count());
        counts.put("tue", 0L);
        counts.put("wed", 0L);
        counts.put("thu", 0L);
        counts.put("fri", 0L);
        counts.put("sat", 0L);
        counts.put("sun", 0L);
        return counts;
    }
}