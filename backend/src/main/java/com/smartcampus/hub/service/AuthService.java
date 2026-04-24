package com.smartcampus.hub.service;

import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ParentRepository parentRepository;
    @Autowired private LecturerRepository lecturerRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Transactional
    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Create corresponding profile
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
                break;
            case "LECTURER":
                Lecturer lecturer = new Lecturer();
                lecturer.setUser(savedUser);
                lecturerRepository.save(lecturer);
                break;
        }
        
        return savedUser;
    }
}
