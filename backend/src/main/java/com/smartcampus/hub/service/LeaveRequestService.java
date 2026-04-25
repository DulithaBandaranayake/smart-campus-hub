package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.LeaveRequestDTO;
import com.smartcampus.hub.model.LeaveRequest;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.model.Parent;
import com.smartcampus.hub.repository.LeaveRequestRepository;
import com.smartcampus.hub.repository.StudentRepository;
import com.smartcampus.hub.repository.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ParentRepository parentRepository;

    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getLeaveRequestsByParentId(Long parentId) {
        return leaveRequestRepository.findAll().stream()
                .filter(lr -> lr.getStudent() != null && lr.getStudent().getParent() != null 
                    && lr.getStudent().getParent().getId().equals(parentId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getLeaveRequestsByStudentId(Long studentId) {
        return leaveRequestRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getByStudentUserId(Long userId) {
        return leaveRequestRepository.findAll().stream()
                .filter(lr -> lr.getStudent() != null 
                    && lr.getStudent().getUser() != null
                    && lr.getStudent().getUser().getId().equals(userId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaveRequestDTO> getByParentUserId(Long parentUserId) {
        return leaveRequestRepository.findAll().stream()
                .filter(lr -> lr.getStudent() != null 
                    && lr.getStudent().getParent() != null
                    && lr.getStudent().getParent().getUser() != null
                    && lr.getStudent().getParent().getUser().getId().equals(parentUserId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public LeaveRequestDTO createLeaveRequest(LeaveRequestDTO dto) {
        if (dto.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setStudent(student);
        leaveRequest.setReason(dto.getReason() != null ? dto.getReason() : "No reason provided");
        leaveRequest.setStartDate(java.time.LocalDate.parse(dto.getStartDate()));
        leaveRequest.setEndDate(java.time.LocalDate.parse(dto.getEndDate()));
        leaveRequest.setStatus("PENDING_PARENT");
        leaveRequest.setCreatedAt(LocalDateTime.now());
        
        return mapToDTO(leaveRequestRepository.save(leaveRequest));
    }

    public LeaveRequestDTO parentApprove(Long id, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        lr.setStatus("PENDING_ADMIN");
        lr.setParentComment(comment);
        lr.setParentReviewedAt(LocalDateTime.now());
        
        return mapToDTO(leaveRequestRepository.save(lr));
    }

    public LeaveRequestDTO parentReject(Long id, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        lr.setStatus("REJECTED");
        lr.setParentComment(comment);
        lr.setParentReviewedAt(LocalDateTime.now());
        
        return mapToDTO(leaveRequestRepository.save(lr));
    }

    public LeaveRequestDTO adminApprove(Long id, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        lr.setStatus("APPROVED");
        lr.setAdminComment(comment);
        lr.setAdminReviewedAt(LocalDateTime.now());
        
        return mapToDTO(leaveRequestRepository.save(lr));
    }

    public LeaveRequestDTO adminReject(Long id, String comment) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        
        lr.setStatus("REJECTED");
        lr.setAdminComment(comment);
        lr.setAdminReviewedAt(LocalDateTime.now());
        
        return mapToDTO(leaveRequestRepository.save(lr));
    }

    public void deleteLeaveRequest(Long id) {
        leaveRequestRepository.deleteById(id);
    }

    private LeaveRequestDTO mapToDTO(LeaveRequest lr) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setId(lr.getId());
        
        if (lr.getStudent() != null) {
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
        }
        
        dto.setReason(lr.getReason());
        dto.setStartDate(lr.getStartDate() != null ? lr.getStartDate().toString() : null);
        dto.setEndDate(lr.getEndDate() != null ? lr.getEndDate().toString() : null);
        dto.setStatus(lr.getStatus());
        dto.setParentComment(lr.getParentComment());
        dto.setAdminComment(lr.getAdminComment());
        dto.setCreatedAt(lr.getCreatedAt() != null ? lr.getCreatedAt().toString() : null);
        dto.setParentReviewedAt(lr.getParentReviewedAt() != null ? lr.getParentReviewedAt().toString() : null);
        dto.setAdminReviewedAt(lr.getAdminReviewedAt() != null ? lr.getAdminReviewedAt().toString() : null);
        
        return dto;
    }
}