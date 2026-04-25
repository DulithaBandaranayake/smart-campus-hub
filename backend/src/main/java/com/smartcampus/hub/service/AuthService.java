package com.smartcampus.hub.service;

import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private PasswordResetRepository passwordResetRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Transactional
    public User register(User user, List<Long> studentIds) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Only ADMIN users are auto-approved, others need admin approval
        if (!user.getRole().equals("ADMIN")) {
            user.setApproved(false);
            user.setPasswordResetRequested(true);
        }
        
        User savedUser = userRepository.save(user);

        // Create corresponding profile and link children for parents
        switch (savedUser.getRole().toUpperCase()) {
            case "STUDENT":
                Student student = new Student();
                student.setUser(savedUser);
                studentRepository.save(student);
                break;
            case "PARENT":
                Parent parent = new Parent();
                parent.setUser(savedUser);
                parentRepository.save(parent);
                
                // Link children
                if (studentIds != null && !studentIds.isEmpty()) {
                    for (Long studentId : studentIds) {
                        studentRepository.findById(studentId).ifPresent(s -> {
                            s.setParent(parent);
                            studentRepository.save(s);
                        });
                    }
                }
                break;
            case "LECTURER":
                Lecturer lecturer = new Lecturer();
                lecturer.setUser(savedUser);
                lecturerRepository.save(lecturer);
                break;
        }
        
        return savedUser;
    }

    public Map<String, Object> requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create a password reset request (pending admin approval)
        PasswordReset reset = new PasswordReset();
        reset.setUser(user);
        reset.setToken(UUID.randomUUID().toString());
        reset.setApproved(false);
        passwordResetRepository.save(reset);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset request submitted. Admin will approve it.");
        return response;
    }

    public Map<String, Object> resetPassword(String token, String newPassword) {
        PasswordReset reset = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        
        if (!reset.isApproved()) {
            throw new RuntimeException("Password reset not yet approved");
        }
        
        User user = reset.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetRequested(false);
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return response;
    }

    public String getOrCreatePasswordResetToken(User user) {
        PasswordReset existing = passwordResetRepository.findByUserIdAndApprovedFalse(user.getId())
                .orElse(null);
        
        if (existing != null) {
            return existing.getToken();
        }
        
        PasswordReset reset = new PasswordReset();
        reset.setUser(user);
        reset.setToken(UUID.randomUUID().toString());
        reset.setApproved(false);
        passwordResetRepository.save(reset);
        
        return reset.getToken();
    }
}