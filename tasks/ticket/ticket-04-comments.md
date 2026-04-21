# Task ticket-04 — Comment Entity + Service + Controller

## Goal
Let users and staff add comments on tickets, with ownership rules: only the comment author (or ADMIN) can edit or delete.

## Prerequisite
ticket-02

## Context
- DB schema: see `tasks/CONTRACTS.md § DB: comments`
- Endpoint contracts: see `tasks/CONTRACTS.md § Ticket API` (comment endpoints)
- Ownership enforced in service using `userId` from request body (auth-04 replaces with SecurityContext)

## What to build
- `entity/Comment.java` (new)
- `repository/CommentRepository.java` (new)
- `dto/CommentRequestDTO.java` (new)
- `dto/CommentDTO.java` (new)
- `service/CommentService.java` (new)
- `controller/CommentController.java` (new) — mapped under `/api/v1/tickets/{ticketId}/comments`

## Steps
1. `Comment` entity (`@Table(name = "comments")`):
   - `id`, `ticket` ManyToOne LAZY NotNull, `user` ManyToOne LAZY NotNull, `content` TEXT NotBlank, `createdAt` (insert only), `updatedAt` (`@PreUpdate`)
2. `CommentRepository extends JpaRepository<Comment, Long>`:
   - `List<Comment> findByTicketIdOrderByCreatedAtAsc(Long ticketId)`
3. `CommentRequestDTO`: `ticketId` (Long), `userId` (Long, removed in auth-04), `content` (String NotBlank).
4. `CommentDTO`: `id`, `ticketId`, `userId`, `userName`, `userAvatar` (User.profileImageUrl), `content`, `createdAt`, `updatedAt`. Static `fromEntity`.
5. `CommentService`:
   - `getComments(Long ticketId)` → `List<CommentDTO>` ordered by createdAt asc
   - `addComment(Long ticketId, CommentRequestDTO dto)` → validate ticket exists; save; return `CommentDTO`
   - `updateComment(Long commentId, Long requestingUserId, String content)` → load comment; check `comment.getUser().getId().equals(requestingUserId)`, throw `AccessDeniedException` if not; update content + updatedAt; save
   - `deleteComment(Long commentId, Long requestingUserId, boolean isAdmin)` → allow if owner OR `isAdmin` flag true; delete
   - `isAdmin` flag is always false until auth-04 wires real role check
6. `CommentController` at `@RequestMapping("/api/v1/tickets/{ticketId}/comments")`:
   - `GET /` → `List<CommentDTO>`
   - `POST /` → body `CommentRequestDTO` → 201 `CommentDTO`
   - `PUT /{commentId}` → body `{ "userId": Long, "content": String }` → `CommentDTO`
   - `DELETE /{commentId}` → query param `?userId=Long` → 204

## Verification
```bash
# Add comment to ticket 1
curl -X POST http://localhost:8080/api/v1/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{"ticketId":1,"userId":1,"content":"Checked the projector, needs replacement."}'
# → 201 with id, userName

# Edit with wrong user
curl -X PUT http://localhost:8080/api/v1/tickets/1/comments/1 \
  -d '{"userId":99,"content":"hacked"}'
# → 403

# Delete as owner
curl -X DELETE "http://localhost:8080/api/v1/tickets/1/comments/1?userId=1"
# → 204
```

## When done
Mark `- [x] ticket/ticket-04` in `tasks/PROGRESS.md`.
