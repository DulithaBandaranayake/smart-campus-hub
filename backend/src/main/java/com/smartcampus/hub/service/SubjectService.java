package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.SubjectDto;
import com.smartcampus.hub.model.Lecturer;
import com.smartcampus.hub.model.Subject;
import com.smartcampus.hub.repository.LecturerRepository;
import com.smartcampus.hub.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {

    @Autowired private SubjectRepository subjectRepository;
    @Autowired private LecturerRepository lecturerRepository;

    public List<SubjectDto> getAll() {
        return subjectRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<SubjectDto> getByGradeLevel(String gradeLevel) {
        return subjectRepository.findByGradeLevel(gradeLevel).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<SubjectDto> getByLecturerId(Long lecturerId) {
        return subjectRepository.findByLecturerId(lecturerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public SubjectDto getById(Long id) {
        return toDto(subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found")));
    }

    public SubjectDto create(SubjectDto dto) {
        Subject s = new Subject();
        s.setName(dto.getName());
        s.setCode(dto.getCode());
        s.setGradeLevel(dto.getGradeLevel());
        s.setDescription(dto.getDescription());
        if (dto.getLecturerId() != null) {
            Lecturer lecturer = lecturerRepository.findById(dto.getLecturerId())
                    .orElseThrow(() -> new RuntimeException("Lecturer not found"));
            s.setLecturer(lecturer);
        }
        return toDto(subjectRepository.save(s));
    }

    public SubjectDto update(Long id, SubjectDto dto) {
        Subject s = subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
        s.setName(dto.getName());
        s.setCode(dto.getCode());
        s.setGradeLevel(dto.getGradeLevel());
        s.setDescription(dto.getDescription());
        if (dto.getLecturerId() != null) {
            Lecturer lecturer = lecturerRepository.findById(dto.getLecturerId())
                    .orElseThrow(() -> new RuntimeException("Lecturer not found"));
            s.setLecturer(lecturer);
        }
        return toDto(subjectRepository.save(s));
    }

    public void delete(Long id) {
        subjectRepository.deleteById(id);
    }

    private SubjectDto toDto(Subject s) {
        SubjectDto dto = new SubjectDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setCode(s.getCode());
        dto.setGradeLevel(s.getGradeLevel());
        dto.setDescription(s.getDescription());
        if (s.getLecturer() != null) {
            dto.setLecturerId(s.getLecturer().getId());
            if (s.getLecturer().getUser() != null) {
                dto.setLecturerName(s.getLecturer().getUser().getName());
            }
        }
        return dto;
    }
}
