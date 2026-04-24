package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.SubjectDto;
import com.smartcampus.hub.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired private SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<SubjectDto>> getAll(
            @RequestParam(required = false) String gradeLevel,
            @RequestParam(required = false) Long lecturerId) {
        if (gradeLevel != null) return ResponseEntity.ok(subjectService.getByGradeLevel(gradeLevel));
        if (lecturerId != null) return ResponseEntity.ok(subjectService.getByLecturerId(lecturerId));
        return ResponseEntity.ok(subjectService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SubjectDto> create(@RequestBody SubjectDto dto) {
        return ResponseEntity.ok(subjectService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectDto> update(@PathVariable Long id, @RequestBody SubjectDto dto) {
        return ResponseEntity.ok(subjectService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
