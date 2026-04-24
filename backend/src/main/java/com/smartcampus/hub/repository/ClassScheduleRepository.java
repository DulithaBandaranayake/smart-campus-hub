package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findBySubjectId(Long subjectId);
    List<ClassSchedule> findByGradeLevel(String gradeLevel);
    List<ClassSchedule> findBySubjectLecturerId(Long lecturerId);
}
