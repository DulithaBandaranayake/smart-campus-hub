package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findBySubjectId(Long subjectId);
    List<Mark> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Mark> findByStudentIdAndSemester(Long studentId, String semester);
}
