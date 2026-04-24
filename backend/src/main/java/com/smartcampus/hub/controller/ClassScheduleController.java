package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ClassScheduleDto;
import com.smartcampus.hub.service.ClassScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ClassScheduleController {

    @Autowired private ClassScheduleService classScheduleService;

    @GetMapping
    public ResponseEntity<List<ClassScheduleDto>> getAll(
            @RequestParam(required = false) String gradeLevel,
            @RequestParam(required = false) Long lecturerId) {
        if (gradeLevel != null) return ResponseEntity.ok(classScheduleService.getByGradeLevel(gradeLevel));
        if (lecturerId != null) return ResponseEntity.ok(classScheduleService.getByLecturerId(lecturerId));
        return ResponseEntity.ok(classScheduleService.getAll());
    }

    @PostMapping
    public ResponseEntity<ClassScheduleDto> create(@RequestBody ClassScheduleDto dto) {
        return ResponseEntity.ok(classScheduleService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassScheduleDto> update(@PathVariable Long id, @RequestBody ClassScheduleDto dto) {
        return ResponseEntity.ok(classScheduleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classScheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
