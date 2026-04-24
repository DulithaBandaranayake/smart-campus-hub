package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.MarkDto;
import com.smartcampus.hub.model.Mark;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.model.Subject;
import com.smartcampus.hub.repository.MarkRepository;
import com.smartcampus.hub.repository.StudentRepository;
import com.smartcampus.hub.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarkService {

    @Autowired private MarkRepository markRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private SubjectRepository subjectRepository;

    public List<MarkDto> getAll() {
        return markRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MarkDto> getByStudentId(Long studentId) {
        return markRepository.findByStudentId(studentId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MarkDto> getBySubjectId(Long subjectId) {
        return markRepository.findBySubjectId(subjectId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public MarkDto create(MarkDto dto) {
        Mark m = new Mark();
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        m.setStudent(student);
        m.setSubject(subject);
        m.setScore(dto.getScore());
        m.setMaxScore(dto.getMaxScore() != null ? dto.getMaxScore() : 100.0);
        m.setExamType(dto.getExamType());
        m.setSemester(dto.getSemester());
        m.setRemarks(dto.getRemarks());
        m.setRecordedAt(LocalDateTime.now());
        return toDto(markRepository.save(m));
    }

    public MarkDto update(Long id, MarkDto dto) {
        Mark m = markRepository.findById(id).orElseThrow(() -> new RuntimeException("Mark not found"));
        m.setScore(dto.getScore());
        m.setMaxScore(dto.getMaxScore() != null ? dto.getMaxScore() : 100.0);
        m.setExamType(dto.getExamType());
        m.setSemester(dto.getSemester());
        m.setRemarks(dto.getRemarks());
        return toDto(markRepository.save(m));
    }

    public void delete(Long id) {
        markRepository.deleteById(id);
    }

    private MarkDto toDto(Mark m) {
        MarkDto dto = new MarkDto();
        dto.setId(m.getId());
        dto.setStudentId(m.getStudent().getId());
        dto.setStudentName(m.getStudent().getUser() != null ? m.getStudent().getUser().getName() : "");
        dto.setSubjectId(m.getSubject().getId());
        dto.setSubjectName(m.getSubject().getName());
        dto.setScore(m.getScore());
        dto.setMaxScore(m.getMaxScore());
        dto.setExamType(m.getExamType());
        dto.setSemester(m.getSemester());
        dto.setRemarks(m.getRemarks());
        dto.setRecordedAt(m.getRecordedAt());
        return dto;
    }
}
