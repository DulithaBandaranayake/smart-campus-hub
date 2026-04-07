package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceAndStatus(Resource resource, String status);

    // Conflict checking
    List<Booking> findByResourceAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            Resource resource, String status, LocalDateTime endTime, LocalDateTime startTime);
}
