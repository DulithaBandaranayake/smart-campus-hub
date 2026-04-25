package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.LeaveRequestDTO;
import com.smartcampus.hub.service.LeaveRequestService;
import com.smartcampus.hub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests() {
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        
        // Filter based on user role
        if ("STUDENT".equals(role)) {
            // Students can only see their own leave requests
            return ResponseEntity.ok(leaveRequestService.getByStudentUserId(userId));
        } else if ("PARENT".equals(role)) {
            // Parents can only see their children's leave requests
            return ResponseEntity.ok(leaveRequestService.getByParentUserId(userId));
        }
        // Admin can see all
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<LeaveRequestDTO>> getByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByStudentId(studentId));
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<LeaveRequestDTO>> getByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByParentId(parentId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDTO> create(@RequestBody LeaveRequestDTO dto) {
        return ResponseEntity.ok(leaveRequestService.createLeaveRequest(dto));
    }

    @PostMapping("/{id}/parent-approve")
    public ResponseEntity<LeaveRequestDTO> parentApprove(@PathVariable Long id, @RequestParam String comment) {
        return ResponseEntity.ok(leaveRequestService.parentApprove(id, comment));
    }

    @PostMapping("/{id}/parent-reject")
    public ResponseEntity<LeaveRequestDTO> parentReject(@PathVariable Long id, @RequestParam String comment) {
        return ResponseEntity.ok(leaveRequestService.parentReject(id, comment));
    }

    @PostMapping("/{id}/admin-approve")
    public ResponseEntity<LeaveRequestDTO> adminApprove(@PathVariable Long id, @RequestParam String comment) {
        return ResponseEntity.ok(leaveRequestService.adminApprove(id, comment));
    }

    @PostMapping("/{id}/admin-reject")
    public ResponseEntity<LeaveRequestDTO> adminReject(@PathVariable Long id, @RequestParam String comment) {
        return ResponseEntity.ok(leaveRequestService.adminReject(id, comment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaveRequestService.deleteLeaveRequest(id);
        return ResponseEntity.ok().build();
    }
}