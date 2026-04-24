package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.LeaveRequestDto;
import com.smartcampus.hub.model.LeaveRequest;
import com.smartcampus.hub.model.Parent;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.repository.LeaveRequestRepository;
import com.smartcampus.hub.repository.ParentRepository;
import com.smartcampus.hub.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;

    public List<LeaveRequestDto> getAll() {
        return leaveRequestRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getByStudentId(Long studentId) {
        return leaveRequestRepository.findByStudentId(studentId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getByParentId(Long parentId) {
        return leaveRequestRepository.findByParentId(parentId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getPendingForParent(Long parentId) {
        return leaveRequestRepository.findByParentIdAndStatus(parentId, "PENDING_PARENT")
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> getByStatus(String status) {
        return leaveRequestRepository.findByStatus(status).stream().map(this::toDto).collect(Collectors.toList());
    }

    public LeaveRequestDto create(LeaveRequestDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (dto.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        LeaveRequest lr = new LeaveRequest();
        lr.setStudent(student);
        lr.setReason(dto.getReason());
        lr.setStartDate(dto.getStartDate());
        lr.setEndDate(dto.getEndDate());
        lr.setStatus("PENDING_PARENT");
        lr.setCreatedAt(LocalDateTime.now());
        return toDto(leaveRequestRepository.save(lr));
    }

    // Parent reviews: APPROVE (moves to PENDING_ADMIN) or REJECT
    public LeaveRequestDto parentReview(Long id, boolean approved, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if (!"PENDING_PARENT".equals(lr.getStatus())) {
            throw new RuntimeException("This leave request is not awaiting parent review");
        }
        lr.setParentComment(comment);
        lr.setParentReviewedAt(LocalDateTime.now());
        lr.setStatus(approved ? "PENDING_ADMIN" : "REJECTED");
        return toDto(leaveRequestRepository.save(lr));
    }

    // Admin reviews: APPROVE or REJECT
    public LeaveRequestDto adminReview(Long id, boolean approved, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        if (!"PENDING_ADMIN".equals(lr.getStatus())) {
            throw new RuntimeException("This leave request is not awaiting admin review");
        }
        lr.setAdminComment(comment);
        lr.setAdminReviewedAt(LocalDateTime.now());
        lr.setStatus(approved ? "APPROVED" : "REJECTED");
        return toDto(leaveRequestRepository.save(lr));
    }

    public void delete(Long id) {
        leaveRequestRepository.deleteById(id);
    }

    private LeaveRequestDto toDto(LeaveRequest lr) {
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setId(lr.getId());
        dto.setStudentId(lr.getStudent().getId());
        if (lr.getStudent().getUser() != null) {
            dto.setStudentName(lr.getStudent().getUser().getName());
        }
        dto.setStudentGrade(lr.getStudent().getGrade());
        if (lr.getStudent().getParent() != null) {
            dto.setParentId(lr.getStudent().getParent().getId());
            if (lr.getStudent().getParent().getUser() != null) {
                dto.setParentName(lr.getStudent().getParent().getUser().getName());
            }
        }
        dto.setReason(lr.getReason());
        dto.setStartDate(lr.getStartDate());
        dto.setEndDate(lr.getEndDate());
        dto.setStatus(lr.getStatus());
        dto.setParentComment(lr.getParentComment());
        dto.setAdminComment(lr.getAdminComment());
        dto.setCreatedAt(lr.getCreatedAt());
        dto.setParentReviewedAt(lr.getParentReviewedAt());
        dto.setAdminReviewedAt(lr.getAdminReviewedAt());
        return dto;
    }
}
