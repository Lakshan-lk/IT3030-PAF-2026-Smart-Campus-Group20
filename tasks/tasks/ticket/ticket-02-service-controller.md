# Task ticket-02 — TicketService + TicketController

## Goal
Implement full ticket CRUD plus assign-technician and status-update workflow, exposed via REST endpoints.

## Prerequisite
ticket-01

## Context
- Entities + repos created in ticket-01
- `GlobalExceptionHandler` at `com.campushub.smartcampus.exception.GlobalExceptionHandler` handles `EntityNotFoundException`
- `UserRepository` at `com.campushub.smartcampus.repository.UserRepository`
- Endpoint contracts: see `tasks/CONTRACTS.md § Ticket API`

## What to build
- `dto/TicketRequestDTO.java` (new)
- `dto/TicketResponseDTO.java` (new)
- `dto/StatusUpdateDTO.java` (new)
- `dto/AttachmentDTO.java` (new)
- `service/TicketService.java` (new)
- `controller/TicketController.java` (new)

## Steps
1. `TicketRequestDTO`: `roomId` (Long nullable), `equipmentId` (Long nullable), `userId` (Long, NotNull — removed in auth-04), `category` (String), `description` (String NotBlank), `priority` (String), `preferredContact` (String).
2. `StatusUpdateDTO`: `status` (String), `reason` (String nullable), `resolutionNotes` (String nullable).
3. `AttachmentDTO`: `id`, `fileName`, `url` (built as `/uploads/<fileName>`), `contentType`. Static `fromEntity`.
4. `TicketResponseDTO`: all ticket fields mapped + `roomName`, `equipmentName`, `userName`, `assignedToName`, `List<AttachmentDTO> attachments`. Static `fromEntity(Ticket t, List<TicketAttachment> attachments)`.
5. `TicketService`:
   - `getAllTickets(String status, String priority, String category, Long assignedTo)` → filter logic
   - `getTicketsByUserId(Long userId)` → user's own tickets
   - `getTicketById(Long id)` → throws EntityNotFoundException if missing
   - `createTicket(TicketRequestDTO dto)` → validate room/equipment exist if provided; set status=OPEN; save
   - `updateTicket(Long id, TicketRequestDTO dto)` → only if status is OPEN; update editable fields
   - `assignTicket(Long id, Long assigneeId)` → validate assignee has role TECHNICIAN; set `assignedTo`; save
   - `updateStatus(Long id, StatusUpdateDTO dto)` → parse status enum; validate allowed transitions; set `rejectionReason` or `resolutionNotes` as appropriate; save
   - `deleteTicket(Long id)` → hard delete (admin only, enforced in auth-04)
6. `TicketController` at `@RequestMapping("/api/v1/tickets")`:
   - `GET /` with optional query params `status`, `priority`, `category`, `assignedTo`, `userId`
   - `GET /{id}`
   - `POST /` → 201
   - `PUT /{id}`
   - `PUT /{id}/assign` → body `{ "assigneeId": Long }`
   - `PUT /{id}/status` → body `StatusUpdateDTO`
   - `DELETE /{id}` → 204
   - No `@PreAuthorize` — auth-04 adds it.

## Verification
```bash
curl -X POST http://localhost:8080/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"roomId":1,"category":"EQUIPMENT_FAULT","description":"Projector not working","priority":"HIGH","preferredContact":"ext-123"}'
# → 201 with id, status: OPEN

curl -X PUT http://localhost:8080/api/v1/tickets/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}'
# → status: IN_PROGRESS
```

## When done
Mark `- [x] ticket/ticket-02` in `tasks/PROGRESS.md`.
