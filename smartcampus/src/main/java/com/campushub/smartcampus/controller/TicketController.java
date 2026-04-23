package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.AssignTicketRequestDTO;
import com.campushub.smartcampus.dto.StatusUpdateDTO;
import com.campushub.smartcampus.dto.TicketRequestDTO;
import com.campushub.smartcampus.dto.TicketResponseDTO;
import com.campushub.smartcampus.service.TicketService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, category, assignedTo, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketRequestDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicket(id, dto));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(@PathVariable Long id, @Valid @RequestBody AssignTicketRequestDTO dto) {
        return ResponseEntity.ok(ticketService.assignTicket(id, dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ticketService.updateStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
