package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    java.util.Optional<Student> findByUserId(Long userId);
    java.util.List<Student> findByParentId(Long parentId);
    java.util.Optional<Student> findByUserEmail(String email);
}
