package com.smartcampus.hub.controller;

import com.smartcampus.hub.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(statsService.getDashboardStats());
    }

    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyStats() {
        return ResponseEntity.ok(statsService.getWeeklyStats());
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyStats() {
        return ResponseEntity.ok(statsService.getMonthlyStats());
    }
}