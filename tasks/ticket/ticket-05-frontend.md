# Task ticket-05 — Ticket Frontend

## Goal
Build the Tickets UI: a list page, a detail view with image upload and comment thread, and admin controls for assigning technicians and updating status.

## Prerequisite
ticket-02, ticket-03, ticket-04 (all ticket backend tasks)

## Context
- `frontend-web/src/pages/TicketsPage.jsx` — exists, likely skeleton
- `frontend-web/src/api/axios.js` — base axios
- No auth — use hardcoded `userId: 1` (auth-04 replaces)

## What to build
- `frontend-web/src/api/ticketApi.js` (new)
- `frontend-web/src/hooks/useTickets.js` (new)
- `frontend-web/src/components/TicketCard.jsx` (new)
- `frontend-web/src/components/TicketFormModal.jsx` (new)
- `frontend-web/src/components/TicketDetailModal.jsx` (new) — or separate page `/tickets/:id`
- `frontend-web/src/components/CommentThread.jsx` (new)
- `frontend-web/src/pages/TicketsPage.jsx` (modify)

## Steps
1. `ticketApi.js`: `getTickets(params)`, `getTicketById(id)`, `createTicket(data)`, `updateTicket(id, data)`, `uploadAttachments(id, formData)`, `assignTicket(id, assigneeId)`, `updateStatus(id, statusData)`, `getComments(ticketId)`, `addComment(ticketId, data)`, `updateComment(ticketId, commentId, data)`, `deleteComment(ticketId, commentId, userId)`.
2. `TicketCard.jsx`: shows category badge, priority colour-coded chip, status badge, description preview, room/equipment name, assigned technician, createdAt. "View Details" button.
3. `TicketsPage.jsx`:
   - "Report Issue" button → opens `TicketFormModal`
   - Filter bar: status, priority, category dropdowns
   - Grid of `TicketCard`
4. `TicketFormModal.jsx`: room select (fetches resources), equipment select (fetches equipment for chosen room, optional), category select, description textarea, priority select, preferred contact input.
5. `TicketDetailModal.jsx` (or page):
   - Header: ticket meta (category, status, priority, room, equipment)
   - Image attachments: grid of thumbnails (click to enlarge); if status=OPEN: file input (multi, max 3 total) with upload button
   - Status update section (admin/tech): status dropdown + reason/notes textarea + "Update" button
   - Assign section (admin): technician dropdown (fetches `/api/v1/auth/users?role=TECHNICIAN`) + "Assign" button
   - `CommentThread` component below
6. `CommentThread.jsx`:
   - List of comments with user avatar (profileImageUrl), name, timestamp, content
   - Edit pencil icon on own comments → inline text edit → save
   - Delete trash icon on own comments
   - New comment input at bottom → submit adds to thread

## Verification
1. `npm run dev` → `/tickets` shows card list
2. "Report Issue" → fill form with room + equipment → submit → card appears with status OPEN
3. Click card → detail modal → upload image → thumbnail appears
4. Admin changes status to IN_PROGRESS → badge updates
5. Add comment → appears in thread; edit comment → updates; delete → removed

## When done
Mark `- [x] ticket/ticket-05` in `tasks/PROGRESS.md`.
