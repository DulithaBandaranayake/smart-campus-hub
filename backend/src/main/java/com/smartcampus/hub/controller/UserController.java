package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.UserDto;
import com.smartcampus.hub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null && !role.isEmpty()) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UserDto>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<UserDto> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/password-reset-requests")
    public ResponseEntity<List<Map<String, Object>>> getPasswordResetRequests() {
        return ResponseEntity.ok(userService.getPasswordResetRequests());
    }

    @PostMapping("/password-reset/{id}/approve")
    public ResponseEntity<Map<String, Object>> approvePasswordReset(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approvePasswordReset(id));
    }

    @PostMapping("/password-reset/{id}/reject")
    public ResponseEntity<Void> rejectPasswordReset(@PathVariable Long id) {
        userService.rejectPasswordReset(id);
        return ResponseEntity.noContent().build();
    }
}
