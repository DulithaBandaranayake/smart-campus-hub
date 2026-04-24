package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.LeaveRequestDto;
import com.smartcampus.hub.service.LeaveRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    @Autowired private LeaveRequestService leaveRequestService;

    @GetMapping
    public ResponseEntity<List<LeaveRequestDto>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String status) {
        if (studentId != null) return ResponseEntity.ok(leaveRequestService.getByStudentId(studentId));
        if (parentId != null) return ResponseEntity.ok(leaveRequestService.getByParentId(parentId));
        if (status != null) return ResponseEntity.ok(leaveRequestService.getByStatus(status));
        return ResponseEntity.ok(leaveRequestService.getAll());
    }

    @GetMapping("/pending-parent/{parentId}")
    public ResponseEntity<List<LeaveRequestDto>> getPendingForParent(@PathVariable Long parentId) {
        return ResponseEntity.ok(leaveRequestService.getPendingForParent(parentId));
    }

    @PostMapping
    public ResponseEntity<LeaveRequestDto> create(@RequestBody LeaveRequestDto dto) {
        return ResponseEntity.ok(leaveRequestService.create(dto));
    }

    @PutMapping("/{id}/parent-review")
    public ResponseEntity<LeaveRequestDto> parentReview(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false, defaultValue = "") String comment) {
        return ResponseEntity.ok(leaveRequestService.parentReview(id, approved, comment));
    }

    @PutMapping("/{id}/admin-review")
    public ResponseEntity<LeaveRequestDto> adminReview(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false, defaultValue = "") String comment) {
        return ResponseEntity.ok(leaveRequestService.adminReview(id, approved, comment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaveRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
