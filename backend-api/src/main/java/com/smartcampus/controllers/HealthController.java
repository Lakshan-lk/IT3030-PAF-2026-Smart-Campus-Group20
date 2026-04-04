package com.smartcampus.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private static final long START_TIME = System.currentTimeMillis();

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        long uptimeSeconds = (System.currentTimeMillis() - START_TIME) / 1000;
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "uptimeSeconds", uptimeSeconds,
                "service", "Smart Campus Operations Hub"
        ));
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of(
                "message", "pong",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> info() {
        return ResponseEntity.ok(Map.of(
                "name", "Smart Campus Operations Hub",
                "version", "0.0.1-SNAPSHOT",
                "java", System.getProperty("java.version"),
                "os", System.getProperty("os.name")
        ));
    }
}
