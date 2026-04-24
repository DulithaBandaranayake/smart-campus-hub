package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AttendanceDto;
import com.smartcampus.hub.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long parentId) {
        if (studentId != null) return ResponseEntity.ok(attendanceService.getByStudentId(studentId));
        if (parentId != null) return ResponseEntity.ok(attendanceService.getByParentId(parentId));
        return ResponseEntity.ok(attendanceService.getAll());
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<Map<String, Long>> getSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getSummary(studentId));
    }

    @PostMapping
    public ResponseEntity<AttendanceDto> upsert(@RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.upsert(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
