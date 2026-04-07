package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.security.JwtUtil;
import com.smartcampus.hub.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        user.setRole("STUDENT"); // Force STUDENT role
        User savedUser = authService.register(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@jakarta.validation.Valid @RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String token = jwtUtil.generateToken(authRequest.getEmail());
            User user = userRepository.findByEmail(authRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(new AuthResponse(token, user));
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
