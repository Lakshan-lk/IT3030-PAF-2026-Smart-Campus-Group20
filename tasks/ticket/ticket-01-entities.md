# Task ticket-01 — Ticket + TicketAttachment Entities + Repositories

## Goal
Create the Ticket and TicketAttachment JPA entities with all required fields and their Spring Data repositories.

## Prerequisite
setup-01, resource-01 (Equipment entity must exist for FK)

## Context
- Package: `com.campushub.smartcampus`
- `entity/Resource.java` — Ticket has nullable FK to resources
- DB schema: see `tasks/CONTRACTS.md § DB: tickets` and `§ DB: ticket_attachments`

## What to build
- `enums/TicketStatus.java` (new)
- `enums/TicketCategory.java` (new)
- `enums/TicketPriority.java` (new)
- `entity/Ticket.java` (new)
- `entity/TicketAttachment.java` (new)
- `repository/TicketRepository.java` (new)
- `repository/TicketAttachmentRepository.java` (new)

## Steps
1. `TicketStatus` enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`.
2. `TicketCategory` enum: `EQUIPMENT_FAULT`, `FACILITY_ISSUE`, `IT_NETWORK`, `SAFETY_HAZARD`.
3. `TicketPriority` enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
4. `Ticket` entity (`@Table(name = "tickets")`):
   - `id` Long PK
   - `room` ManyToOne LAZY nullable → Resource (`@JoinColumn(name = "room_id")`)
   - `equipment` ManyToOne LAZY nullable → Equipment (`@JoinColumn(name = "equipment_id")`)
   - `user` ManyToOne LAZY NOT NULL → User
   - `category` TicketCategory Enumerated STRING NotNull
   - `description` TEXT NotBlank
   - `priority` TicketPriority Enumerated STRING NotNull
   - `status` TicketStatus Enumerated STRING default OPEN
   - `assignedTo` ManyToOne LAZY nullable → User (`@JoinColumn(name = "assigned_to")`)
   - `resolutionNotes` TEXT nullable
   - `rejectionReason` VARCHAR(500) nullable
   - `preferredContact` VARCHAR(200)
   - `createdAt` LocalDateTime set on insert (`@Column(updatable=false)`)
   - `updatedAt` LocalDateTime updated via `@PreUpdate`
5. `TicketAttachment` entity (`@Table(name = "ticket_attachments")`):
   - `id` Long PK
   - `ticket` ManyToOne LAZY NOT NULL → Ticket
   - `fileName` VARCHAR(255) NOT NULL
   - `filePath` VARCHAR(500) NOT NULL
   - `contentType` VARCHAR(100)
   - `createdAt` LocalDateTime
6. `TicketRepository extends JpaRepository<Ticket, Long>`:
   - `List<Ticket> findByUserId(Long userId)`
   - `List<Ticket> findByStatus(TicketStatus status)`
   - `List<Ticket> findByAssignedToId(Long userId)`
   - `List<Ticket> findByPriority(TicketPriority priority)`
   - `List<Ticket> findByCategoryAndStatus(TicketCategory cat, TicketStatus status)`
7. `TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long>`:
   - `List<TicketAttachment> findByTicketId(Long ticketId)`
   - `long countByTicketId(Long ticketId)`

## Verification
Start app → `DESCRIBE tickets;` and `DESCRIBE ticket_attachments;` in MySQL — all columns present with correct types.

## When done
Mark `- [x] ticket/ticket-01` in `tasks/PROGRESS.md`.
