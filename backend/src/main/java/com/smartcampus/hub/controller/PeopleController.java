package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.StudentDTO;
import com.smartcampus.hub.dto.ParentDTO;
import com.smartcampus.hub.dto.LecturerDTO;
import com.smartcampus.hub.service.PeopleService;
import com.smartcampus.hub.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/people")
public class PeopleController {

    @Autowired private PeopleService peopleService;
    @Autowired private SecurityUtils securityUtils;

    // Students
    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        // Filter based on user role
        String role = securityUtils.getCurrentUserRole();
        if ("PARENT".equals(role)) {
            // Parents can only see their own children
            return ResponseEntity.ok(peopleService.getStudentsByParentId(securityUtils.getCurrentUserId()));
        } else if ("STUDENT".equals(role)) {
            // Students can only see themselves
            return ResponseEntity.ok(peopleService.getStudentsByUserId(securityUtils.getCurrentUserId()));
        }
        // Admin can see all
        return ResponseEntity.ok(peopleService.getAllStudents());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(peopleService.getStudentById(id));
    }

    @GetMapping("/students/search")
    public ResponseEntity<StudentDTO> searchStudentByEmail(@RequestParam String email) {
        return ResponseEntity.ok(peopleService.getStudentByEmail(email));
    }

    @PostMapping("/students")
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO dto) {
        return ResponseEntity.ok(peopleService.createStudent(dto));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(peopleService.updateStudent(id, dto));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        peopleService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    // Parents
    @GetMapping("/parents")
    public ResponseEntity<List<ParentDTO>> getAllParents() {
        String role = securityUtils.getCurrentUserRole();
        if ("PARENT".equals(role)) {
            // Parents can only see their own profile
            return ResponseEntity.ok(peopleService.getParentsByUserId(securityUtils.getCurrentUserId()));
        }
        // Admin can see all
        return ResponseEntity.ok(peopleService.getAllParents());
    }

    @GetMapping("/parents/{id}")
    public ResponseEntity<ParentDTO> getParent(@PathVariable Long id) {
        return ResponseEntity.ok(peopleService.getParentById(id));
    }

    @PostMapping("/parents")
    public ResponseEntity<ParentDTO> createParent(@RequestBody ParentDTO dto) {
        return ResponseEntity.ok(peopleService.createParent(dto));
    }

    @PutMapping("/parents/{id}")
    public ResponseEntity<ParentDTO> updateParent(@PathVariable Long id, @RequestBody ParentDTO dto) {
        return ResponseEntity.ok(peopleService.updateParent(id, dto));
    }

    @DeleteMapping("/parents/{id}")
    public ResponseEntity<Void> deleteParent(@PathVariable Long id) {
        peopleService.deleteParent(id);
        return ResponseEntity.ok().build();
    }

    // Lecturers
    @GetMapping("/lecturers")
    public ResponseEntity<List<LecturerDTO>> getAllLecturers() {
        String role = securityUtils.getCurrentUserRole();
        if ("LECTURER".equals(role)) {
            // Lecturers can only see their own profile
            return ResponseEntity.ok(peopleService.getLecturersByUserId(securityUtils.getCurrentUserId()));
        }
        // Admin can see all
        return ResponseEntity.ok(peopleService.getAllLecturers());
    }

    @GetMapping("/lecturers/{id}")
    public ResponseEntity<LecturerDTO> getLecturer(@PathVariable Long id) {
        return ResponseEntity.ok(peopleService.getLecturerById(id));
    }

    @PostMapping("/lecturers")
    public ResponseEntity<LecturerDTO> createLecturer(@RequestBody LecturerDTO dto) {
        return ResponseEntity.ok(peopleService.createLecturer(dto));
    }

    @PutMapping("/lecturers/{id}")
    public ResponseEntity<LecturerDTO> updateLecturer(@PathVariable Long id, @RequestBody LecturerDTO dto) {
        return ResponseEntity.ok(peopleService.updateLecturer(id, dto));
    }

    @DeleteMapping("/lecturers/{id}")
    public ResponseEntity<Void> deleteLecturer(@PathVariable Long id) {
        peopleService.deleteLecturer(id);
        return ResponseEntity.ok().build();
    }
}