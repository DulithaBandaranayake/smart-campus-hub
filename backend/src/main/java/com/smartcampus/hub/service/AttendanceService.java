package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AttendanceDTO;
import com.smartcampus.hub.model.Attendance;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.repository.AttendanceRepository;
import com.smartcampus.hub.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByParentId(Long parentId) {
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getStudent() != null && a.getStudent().getParent() != null
                    && a.getStudent().getParent().getId().equals(parentId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByUserId(Long userId) {
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getStudent() != null && a.getStudent().getUser() != null
                    && a.getStudent().getUser().getId().equals(userId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByParentUserId(Long parentUserId) {
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getStudent() != null 
                    && a.getStudent().getParent() != null 
                    && a.getStudent().getParent().getUser() != null
                    && a.getStudent().getParent().getUser().getId().equals(parentUserId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AttendanceDTO upsertAttendance(AttendanceDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Check if attendance exists for this student and date
        LocalDate attendanceDate = LocalDate.parse(dto.getDate());
        List<Attendance> existing = attendanceRepository.findByStudentId(dto.getStudentId());
        Attendance attendance = existing.stream()
                .filter(a -> a.getDate().equals(attendanceDate))
                .findFirst()
                .orElse(new Attendance());
        
        attendance.setStudent(student);
        attendance.setDate(attendanceDate);
        attendance.setStatus(dto.getStatus() != null ? dto.getStatus() : "PRESENT");
        attendance.setNote(dto.getNote());
        
        return mapToDTO(attendanceRepository.save(attendance));
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }

    public AttendanceDTO mapToDTO(Attendance a) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(a.getId());
        dto.setDate(a.getDate() != null ? a.getDate().toString() : null);
        dto.setStatus(a.getStatus());
        dto.setNote(a.getNote());
        
        if (a.getStudent() != null) {
            dto.setStudentId(a.getStudent().getId());
            if (a.getStudent().getUser() != null) {
                dto.setStudentName(a.getStudent().getUser().getName());
            }
            dto.setStudentGrade(a.getStudent().getGrade());
            if (a.getStudent().getParent() != null) {
                dto.setParentId(a.getStudent().getParent().getId());
            }
        }
        
        return dto;
    }
}