package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.MarkDto;
import com.smartcampus.hub.service.MarkService;
import com.smartcampus.hub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    @Autowired private MarkService markService;
    @Autowired private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<MarkDto>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId) {
        
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        
        // Filter based on user role
        if ("STUDENT".equals(role)) {
            // Students can only see their own marks
            return ResponseEntity.ok(markService.getByUserId(userId));
        } else if ("PARENT".equals(role)) {
            // Parents can only see their children's marks
            return ResponseEntity.ok(markService.getByParentUserId(userId));
        } else if ("LECTURER".equals(role)) {
            // Lecturers can only see marks for subjects they teach
            return ResponseEntity.ok(markService.getByLecturerUserId(userId));
        }
        
        // Admin can see all or filter by parameters
        if (studentId != null) return ResponseEntity.ok(markService.getByStudentId(studentId));
        if (subjectId != null) return ResponseEntity.ok(markService.getBySubjectId(subjectId));
        return ResponseEntity.ok(markService.getAll());
    }

    @PostMapping
    public ResponseEntity<MarkDto> create(@RequestBody MarkDto dto) {
        // Check if lecturer is authorized to create mark for this subject
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        if ("LECTURER".equals(role)) {
            if (!markService.canLecturerModifyMarkBySubjectId(userId, dto.getSubjectId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(markService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarkDto> update(@PathVariable Long id, @RequestBody MarkDto dto) {
        // Check if lecturer is authorized to update this mark
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        if ("LECTURER".equals(role)) {
            if (!markService.canLecturerModifyMarkByMarkId(userId, id)) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(markService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Check if lecturer is authorized to delete this mark
        String role = securityUtils.getCurrentUserRole();
        Long userId = securityUtils.getCurrentUserId();
        if ("LECTURER".equals(role)) {
            if (!markService.canLecturerModifyMarkByMarkId(userId, id)) {
                return ResponseEntity.status(403).build();
            }
        }
        markService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
