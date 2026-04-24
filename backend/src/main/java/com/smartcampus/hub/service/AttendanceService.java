package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.AttendanceDto;
import com.smartcampus.hub.model.Attendance;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.repository.AttendanceRepository;
import com.smartcampus.hub.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private StudentRepository studentRepository;

    public List<AttendanceDto> getAll() {
        return attendanceRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AttendanceDto> getByStudentId(Long studentId) {
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<AttendanceDto> getByParentId(Long parentId) {
        return attendanceRepository.findByParentId(parentId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public AttendanceDto upsert(AttendanceDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance a = attendanceRepository.findByStudentIdAndDate(dto.getStudentId(), dto.getDate())
                .orElse(new Attendance());
        a.setStudent(student);
        a.setDate(dto.getDate());
        a.setStatus(dto.getStatus());
        a.setNote(dto.getNote());
        return toDto(attendanceRepository.save(a));
    }

    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }

    public java.util.Map<String, Long> getSummary(Long studentId) {
        java.util.Map<String, Long> summary = new java.util.HashMap<>();
        summary.put("PRESENT", attendanceRepository.countByStudentIdAndStatus(studentId, "PRESENT"));
        summary.put("ABSENT", attendanceRepository.countByStudentIdAndStatus(studentId, "ABSENT"));
        summary.put("LATE", attendanceRepository.countByStudentIdAndStatus(studentId, "LATE"));
        summary.put("EXCUSED", attendanceRepository.countByStudentIdAndStatus(studentId, "EXCUSED"));
        return summary;
    }

    private AttendanceDto toDto(Attendance a) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(a.getId());
        dto.setStudentId(a.getStudent().getId());
        if (a.getStudent().getUser() != null) {
            dto.setStudentName(a.getStudent().getUser().getName());
        }
        dto.setStudentGrade(a.getStudent().getGrade());
        dto.setDate(a.getDate());
        dto.setStatus(a.getStatus());
        dto.setNote(a.getNote());
        return dto;
    }
}
