package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.MarkDto;
import com.smartcampus.hub.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    @Autowired private MarkService markService;

    @GetMapping
    public ResponseEntity<List<MarkDto>> getAll(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long subjectId) {
        if (studentId != null) return ResponseEntity.ok(markService.getByStudentId(studentId));
        if (subjectId != null) return ResponseEntity.ok(markService.getBySubjectId(subjectId));
        return ResponseEntity.ok(markService.getAll());
    }

    @PostMapping
    public ResponseEntity<MarkDto> create(@RequestBody MarkDto dto) {
        return ResponseEntity.ok(markService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarkDto> update(@PathVariable Long id, @RequestBody MarkDto dto) {
        return ResponseEntity.ok(markService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        markService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
