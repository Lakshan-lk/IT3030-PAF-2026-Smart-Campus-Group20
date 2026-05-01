package com.campushub.smartcampus.chatbot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> request) {
        String message = request.getOrDefault("message", "").trim();
        String conversationId = request.getOrDefault("conversationId", "default");

        Long userId = null;
        String userIdText = request.getOrDefault("userId", "").trim();

        if (!userIdText.isBlank()) {
            try {
                userId = Long.parseLong(userIdText);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "reply", "Invalid userId. Please send userId as a number."
                ));
            }
        }

        if (message.isEmpty()) {
            return ResponseEntity.ok(Map.of("reply", "Please type a question first."));
        }

        String reply = chatbotService.ask(message, conversationId, userId);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}