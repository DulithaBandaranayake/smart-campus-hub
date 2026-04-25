package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByToken(String token);
    Optional<PasswordReset> findByUserIdAndApprovedFalse(Long userId);
    List<PasswordReset> findByApprovedFalseOrderByRequestedAtDesc();
    Optional<PasswordReset> findByUserIdAndApprovedFalseAndTokenIsNotNull(Long userId);
}