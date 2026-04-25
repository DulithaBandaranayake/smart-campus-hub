package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.UserDto;
import com.smartcampus.hub.model.Lecturer;
import com.smartcampus.hub.model.Parent;
import com.smartcampus.hub.model.Student;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.LecturerRepository;
import com.smartcampus.hub.repository.ParentRepository;
import com.smartcampus.hub.repository.PasswordResetRepository;
import com.smartcampus.hub.repository.StudentRepository;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<UserDto> getUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().equalsIgnoreCase(role))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(UserDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPassword(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "password123"));
        user.setRole(dto.getRole().toUpperCase());

        user = userRepository.save(user);
        saveProfile(user, dto);

        return mapToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setRole(dto.getRole().toUpperCase());
        user = userRepository.save(user);

        saveProfile(user, dto);

        return mapToDto(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        switch (user.getRole()) {
            case "STUDENT":
                studentRepository.findByUserId(user.getId()).ifPresent(studentRepository::delete);
                break;
            case "PARENT":
                parentRepository.findByUserId(user.getId()).ifPresent(parentRepository::delete);
                break;
            case "LECTURER":
                lecturerRepository.findByUserId(user.getId()).ifPresent(lecturerRepository::delete);
                break;
        }
        
        userRepository.delete(user);
    }

    public List<UserDto> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(u -> !u.isApproved() && u.getRole() != null && !u.getRole().equals("ADMIN"))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto approveUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setApproved(true);
        user.setPasswordResetRequested(true);
        user = userRepository.save(user);
        return mapToDto(user);
    }

    public List<Map<String, Object>> getPasswordResetRequests() {
        List<Map<String, Object>> results = new java.util.ArrayList<>();
        List<com.smartcampus.hub.model.PasswordReset> pending = passwordResetRepository.findByApprovedFalseOrderByRequestedAtDesc();
        
        for (com.smartcampus.hub.model.PasswordReset pr : pending) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", pr.getId());
            map.put("userId", pr.getUser().getId());
            map.put("userName", pr.getUser().getName());
            map.put("userEmail", pr.getUser().getEmail());
            map.put("requestedAt", pr.getRequestedAt());
            results.add(map);
        }
        return results;
    }

    @Transactional
    public Map<String, Object> approvePasswordReset(Long id) {
        com.smartcampus.hub.model.PasswordReset reset = passwordResetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reset request not found"));
        
        reset.setApproved(true);
        passwordResetRepository.save(reset);
        
        User user = reset.getUser();
        user.setPasswordResetRequested(true);
        userRepository.save(user);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Password reset approved");
        response.put("token", reset.getToken());
        return response;
    }

    @Transactional
    public void rejectPasswordReset(Long id) {
        passwordResetRepository.deleteById(id);
    }

    private void saveProfile(User user, UserDto dto) {
        switch (user.getRole()) {
            case "STUDENT":
                Student student = studentRepository.findByUserId(user.getId()).orElse(new Student());
                student.setUser(user);
                student.setGrade(dto.getGrade());
                student.setEnrollmentDate(dto.getEnrollmentDate());
                if (dto.getParentId() != null) {
                    Parent parent = parentRepository.findById(dto.getParentId()).orElse(null);
                    student.setParent(parent);
                }
                studentRepository.save(student);
                break;
            case "PARENT":
                Parent parent = parentRepository.findByUserId(user.getId()).orElse(new Parent());
                parent.setUser(user);
                parent.setPhoneNumber(dto.getPhoneNumber());
                parent.setAddress(dto.getAddress());
                final Parent savedParent = parentRepository.save(parent);

                // Link students if provided
                if (dto.getStudentIds() != null) {
                    // Clear old links
                    List<Student> oldStudents = studentRepository.findByParentId(savedParent.getId());
                    for (Student s : oldStudents) {
                        s.setParent(null);
                        studentRepository.save(s);
                    }

                    // Set new links
                    for (Long studentId : dto.getStudentIds()) {
                        studentRepository.findById(studentId).ifPresent(s -> {
                            s.setParent(savedParent);
                            studentRepository.save(s);
                        });
                    }
                }
                break;
            case "LECTURER":
                Lecturer lecturer = lecturerRepository.findByUserId(user.getId()).orElse(new Lecturer());
                lecturer.setUser(user);
                lecturer.setDepartment(dto.getDepartment());
                lecturer.setEmployeeId(dto.getEmployeeId());
                lecturerRepository.save(lecturer);
                break;
        }
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());

        switch (user.getRole()) {
            case "STUDENT":
                Optional<Student> sOpt = studentRepository.findByUserId(user.getId());
                if (sOpt.isPresent()) {
                    Student s = sOpt.get();
                    dto.setStudentId(s.getId());
                    dto.setGrade(s.getGrade());
                    dto.setEnrollmentDate(s.getEnrollmentDate());
                    if (s.getParent() != null) {
                        dto.setParentId(s.getParent().getId());
                    }
                }
                break;
            case "PARENT":
                Optional<Parent> pOpt = parentRepository.findByUserId(user.getId());
                if (pOpt.isPresent()) {
                    Parent p = pOpt.get();
                    dto.setParentId(p.getId());
                    dto.setPhoneNumber(p.getPhoneNumber());
                    dto.setAddress(p.getAddress());
                    
                    // Populate student IDs
                    List<Long> sIds = studentRepository.findByParentId(p.getId()).stream()
                            .map(Student::getId)
                            .collect(Collectors.toList());
                    dto.setStudentIds(sIds);
                }
                break;
            case "LECTURER":
                Optional<Lecturer> lOpt = lecturerRepository.findByUserId(user.getId());
                if (lOpt.isPresent()) {
                    Lecturer l = lOpt.get();
                    dto.setLecturerId(l.getId());
                    dto.setDepartment(l.getDepartment());
                    dto.setEmployeeId(l.getEmployeeId());
                }
                break;
        }

        return dto;
    }
}
