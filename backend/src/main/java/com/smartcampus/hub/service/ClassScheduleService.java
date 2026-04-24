package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ClassScheduleDto;
import com.smartcampus.hub.model.ClassSchedule;
import com.smartcampus.hub.model.Subject;
import com.smartcampus.hub.repository.ClassScheduleRepository;
import com.smartcampus.hub.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassScheduleService {

    @Autowired private ClassScheduleRepository classScheduleRepository;
    @Autowired private SubjectRepository subjectRepository;

    public List<ClassScheduleDto> getAll() {
        return classScheduleRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ClassScheduleDto> getByGradeLevel(String gradeLevel) {
        return classScheduleRepository.findByGradeLevel(gradeLevel).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ClassScheduleDto> getByLecturerId(Long lecturerId) {
        return classScheduleRepository.findBySubjectLecturerId(lecturerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ClassScheduleDto create(ClassScheduleDto dto) {
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        ClassSchedule cs = new ClassSchedule();
        cs.setSubject(subject);
        cs.setDayOfWeek(dto.getDayOfWeek());
        cs.setStartTime(dto.getStartTime());
        cs.setEndTime(dto.getEndTime());
        cs.setRoom(dto.getRoom());
        cs.setSemester(dto.getSemester());
        cs.setGradeLevel(dto.getGradeLevel());
        return toDto(classScheduleRepository.save(cs));
    }

    public ClassScheduleDto update(Long id, ClassScheduleDto dto) {
        ClassSchedule cs = classScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        if (dto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(dto.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            cs.setSubject(subject);
        }
        cs.setDayOfWeek(dto.getDayOfWeek());
        cs.setStartTime(dto.getStartTime());
        cs.setEndTime(dto.getEndTime());
        cs.setRoom(dto.getRoom());
        cs.setSemester(dto.getSemester());
        cs.setGradeLevel(dto.getGradeLevel());
        return toDto(classScheduleRepository.save(cs));
    }

    public void delete(Long id) {
        classScheduleRepository.deleteById(id);
    }

    private ClassScheduleDto toDto(ClassSchedule cs) {
        ClassScheduleDto dto = new ClassScheduleDto();
        dto.setId(cs.getId());
        dto.setSubjectId(cs.getSubject().getId());
        dto.setSubjectName(cs.getSubject().getName());
        dto.setSubjectCode(cs.getSubject().getCode());
        if (cs.getSubject().getLecturer() != null) {
            dto.setLecturerId(cs.getSubject().getLecturer().getId());
            if (cs.getSubject().getLecturer().getUser() != null) {
                dto.setLecturerName(cs.getSubject().getLecturer().getUser().getName());
            }
        }
        dto.setDayOfWeek(cs.getDayOfWeek());
        dto.setStartTime(cs.getStartTime());
        dto.setEndTime(cs.getEndTime());
        dto.setRoom(cs.getRoom());
        dto.setSemester(cs.getSemester());
        dto.setGradeLevel(cs.getGradeLevel());
        return dto;
    }
}
