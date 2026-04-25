package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.AuthRequest;
import com.smartcampus.hub.dto.AuthResponse;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.repository.PasswordResetRepository;
import com.smartcampus.hub.security.JwtUtil;
import com.smartcampus.hub.service.AuthService;
import com.smartcampus.hub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:}")
    private String googleRedirectUri;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody Map<String, Object> payload) {
        User user = new User();
        user.setName((String) payload.get("name"));
        user.setEmail((String) payload.get("email"));
        user.setPassword((String) payload.get("password"));
        user.setRole((String) payload.get("role"));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        List<Long> studentIds = null;
        if (payload.get("studentIds") != null) {
            @SuppressWarnings("unchecked")
            List<Long> ids = (List<Long>) payload.get("studentIds");
            studentIds = ids;
        }
        
        User savedUser = authService.register(user, studentIds);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, userService.getUserById(savedUser.getId())));
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
            
            if (!user.isApproved()) {
                return ResponseEntity.status(403).body(Map.of("message", "Account not yet approved by admin"));
            }
            
            boolean needsPasswordReset = user.isPasswordResetRequested();
            String passwordResetToken = null;
            
            if (needsPasswordReset) {
                passwordResetToken = authService.getOrCreatePasswordResetToken(user);
                user.setPasswordResetRequested(false);
                userRepository.save(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userService.getUserById(user.getId()));
            if (needsPasswordReset) {
                response.put("needsPasswordReset", true);
                response.put("passwordResetToken", passwordResetToken);
            }
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/google/url")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl() {
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + googleClientId +
                "&redirect_uri=" + googleRedirectUri +
                "&response_type=code" +
                "&scope=email%20profile" +
                "&access_type=offline" +
                "&prompt=consent";
        Map<String, String> response = new HashMap<>();
        response.put("url", googleAuthUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("client_id", googleClientId);
            tokenRequest.put("client_secret", System.getenv("GOOGLE_CLIENT_SECRET") != null ? 
                System.getenv("GOOGLE_CLIENT_SECRET") : "");
            tokenRequest.put("code", code);
            tokenRequest.put("grant_type", "authorization_code");
            tokenRequest.put("redirect_uri", googleRedirectUri);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restTemplate.postForObject(
                "https://oauth2.googleapis.com/token", tokenRequest, Map.class);
            
            if (tokenResponse != null && tokenResponse.get("access_token") != null) {
                String accessToken = (String) tokenResponse.get("access_token");
                
                String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = restTemplate.getForObject(userInfoUrl, Map.class);
                
                if (userInfo != null) {
                    String email = (String) userInfo.get("email");
                    String name = (String) userInfo.get("name");
                    String googleId = (String) userInfo.get("sub");
                    
                    Optional<User> existingUser = userRepository.findByEmail(email);
                    User user;
                    if (existingUser.isPresent()) {
                        user = existingUser.get();
                        if (!user.isApproved()) {
                            return ResponseEntity.status(403).body(Map.of("error", "Account not yet approved by admin"));
                        }
                    } else {
                        user = new User();
                        user.setEmail(email);
                        user.setName(name != null ? name : email);
                        user.setRole("USER");
                        user.setGoogleId(googleId);
                        user.setPassword(passwordEncoder.encode("GOOGLE_OAUTH_" + googleId));
                        user = userRepository.save(user);
                    }
                    
                    String jwtToken = jwtUtil.generateToken(user.getEmail());
                    return ResponseEntity.ok(new AuthResponse(jwtToken, userService.getUserById(user.getId())));
                }
            }
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);
            if (email != null) {
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    return ResponseEntity.ok(userService.getUserById(user.getId()));
                }
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email required"));
        }
        return ResponseEntity.ok(authService.requestPasswordReset(email));
    }

    @PostMapping("/password-reset/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable String token, @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password required"));
        }
        return ResponseEntity.ok(authService.resetPassword(token, newPassword));
    }
}
