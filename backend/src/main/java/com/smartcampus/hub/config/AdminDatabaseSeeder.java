package com.smartcampus.hub.config;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@nexus.com")) {
            User admin = new User();
            admin.setName("Nexus Admin");
            admin.setEmail("admin@nexus.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default Admin created: admin@nexus.com / admin123");
        }
    }
}
