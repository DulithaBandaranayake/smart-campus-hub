package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByStatus(String status);
}
