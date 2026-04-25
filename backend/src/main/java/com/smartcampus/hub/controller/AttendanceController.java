package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AttendanceDTO;
import com.smartcampus.hub.service.AttendanceService;
import com.smartcampus.hub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long parentId) {
        
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        List<AttendanceDTO> all;
        
        // Filter based on user role
        if ("STUDENT".equals(role)) {
            // Students can only see their own attendance
            all = attendanceService.getAttendanceByUserId(userId);
        } else if ("PARENT".equals(role)) {
            // Parents can only see their children's attendance
            all = attendanceService.getAttendanceByParentUserId(userId);
        } else if (studentId != null) {
            all = attendanceService.getAttendanceByStudentId(studentId);
        } else if (parentId != null) {
            all = attendanceService.getAttendanceByParentId(parentId);
        } else {
            all = attendanceService.getAllAttendance();
        }
        
        return ResponseEntity.ok(all);
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<java.util.Map<String, Long>> getSummary(@PathVariable Long studentId) {
        List<AttendanceDTO> records = attendanceService.getAttendanceByStudentId(studentId);
        
        long present = records.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
        long absent = records.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
        long late = records.stream().filter(r -> "LATE".equals(r.getStatus())).count();
        long excused = records.stream().filter(r -> "EXCUSED".equals(r.getStatus())).count();
        
        java.util.Map<String, Long> summary = new HashMap<>();
        summary.put("PRESENT", present);
        summary.put("ABSENT", absent);
        summary.put("LATE", late);
        summary.put("EXCUSED", excused);
        
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<AttendanceDTO> upsert(@RequestBody AttendanceDTO dto) {
        return ResponseEntity.ok(attendanceService.upsertAttendance(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok().build();
    }
}