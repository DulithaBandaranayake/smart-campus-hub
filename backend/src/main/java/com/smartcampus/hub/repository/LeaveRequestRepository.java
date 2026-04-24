package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStudentId(Long studentId);
    List<LeaveRequest> findByStatus(String status);

    // Get all leave requests for children of a parent
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.student.parent.id = :parentId")
    List<LeaveRequest> findByParentId(Long parentId);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.student.parent.id = :parentId AND lr.status = :status")
    List<LeaveRequest> findByParentIdAndStatus(Long parentId, String status);
}
