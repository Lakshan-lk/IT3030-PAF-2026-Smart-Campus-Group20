package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.CommentDTO;
import com.campushub.smartcampus.dto.CommentRequestDTO;
import com.campushub.smartcampus.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long ticketId, @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(ticketId, dto));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long ticketId, @PathVariable Long commentId, @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.ok(commentService.updateComment(ticketId, commentId, dto));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long ticketId,
                                              @PathVariable Long commentId,
                                              @RequestParam Long userId) {
        commentService.deleteComment(ticketId, commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
