package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporterId(String reporterId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByAssigneeId(String assigneeId);
}
