# Task Prompts

Copy-paste the prompt for your task into a new Claude Code session.
Each session starts fresh — the prompt is self-contained.

---

## Setup

**setup-01 — MySQL Migration**
```
Read tasks/setup/setup-01-mysql-migration.md and CLAUDE.md, then implement the MySQL migration exactly as specified.
```

**setup-02 — GitHub Actions CI**
```
Read tasks/setup/setup-02-github-actions-ci.md and CLAUDE.md, then implement the GitHub Actions CI workflow exactly as specified.
```

---

## Resource Module

**resource-01 — Equipment Entity**
```
Read tasks/resource/resource-01-equipment-entity.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement the Equipment entity, repository, and controller exactly as specified.
```

**resource-02 — ResourceService + DTO**
```
Read tasks/resource/resource-02-service-dto.md, CLAUDE.md, and tasks/CONTRACTS.md, then refactor ResourceController to use a service layer and DTOs exactly as specified.
```

**resource-03 — Availability Filter**
```
Read tasks/resource/resource-03-availability-filter.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement the availability filter endpoint exactly as specified.
```

**resource-04 — Facilities Frontend**
```
Read tasks/resource/resource-04-frontend.md, CLAUDE.md, and tasks/CONTRACTS.md, then build the FacilitiesPage and admin CRUD UI exactly as specified.
```

---

## Booking Module

**booking-01 — Entity Enhancements**
```
Read tasks/booking/booking-01-entity-enhancements.md, CLAUDE.md, and tasks/CONTRACTS.md, then add the missing fields (attendees, rejectionReason, recurrence) to the Booking entity and DTOs exactly as specified.
```

**booking-02 — Recurring Bookings**
```
Read tasks/booking/booking-02-recurring.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement recurring booking creation and series conflict detection in BookingService exactly as specified.
```

**booking-03 — Approve / Reject / Cancel**
```
Read tasks/booking/booking-03-approve-reject-cancel.md, CLAUDE.md, and tasks/CONTRACTS.md, then fix and complete the booking workflow (reject with reason, cancel approved bookings, cancel series) exactly as specified.
```

**booking-04 — Booking Frontend**
```
Read tasks/booking/booking-04-frontend.md, CLAUDE.md, and tasks/CONTRACTS.md, then build the full booking UI (NewBookingForm with filters + recurring, BookingsPage, AdminBookingsPage) exactly as specified.
```

---

## Ticket Module

**ticket-01 — Ticket Entities**
```
Read tasks/ticket/ticket-01-entities.md, CLAUDE.md, and tasks/CONTRACTS.md, then create the Ticket and TicketAttachment entities, enums, and repositories exactly as specified.
```

**ticket-02 — TicketService + Controller**
```
Read tasks/ticket/ticket-02-service-controller.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement TicketService and TicketController with full CRUD, assign, and status workflow exactly as specified.
```

**ticket-03 — File Upload**
```
Read tasks/ticket/ticket-03-file-upload.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement the multipart attachment upload endpoint and static file serving exactly as specified.
```

**ticket-04 — Comments**
```
Read tasks/ticket/ticket-04-comments.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement the Comment entity, CommentService, and CommentController with ownership rules exactly as specified.
```

**ticket-05 — Ticket Frontend**
```
Read tasks/ticket/ticket-05-frontend.md, CLAUDE.md, and tasks/CONTRACTS.md, then build the full ticket UI (list, detail modal, image upload, comment thread, admin controls) exactly as specified.
```

---

## Auth + Notification Module

**auth-01 — JWT Provider**
```
Read tasks/auth/auth-01-jwt-provider.md, CLAUDE.md, and tasks/CONTRACTS.md, then add Spring Security + JWT dependencies and implement JwtTokenProvider and JwtAuthFilter exactly as specified.
```

**auth-02 — OAuth2 + SecurityConfig**
```
Read tasks/auth/auth-02-oauth2-security-config.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement SecurityConfig, CustomOAuth2UserService, OAuth2AuthSuccessHandler, and AuthController exactly as specified.
```

**auth-03 — Frontend Auth**
```
Read tasks/auth/auth-03-frontend-auth.md, CLAUDE.md, and tasks/CONTRACTS.md, then implement AuthContext, AuthCallbackPage, ProtectedRoute, and wire JWT into axios exactly as specified.
```

**auth-04 — Wire Auth to All Modules**
```
Read tasks/auth/auth-04-wire-all-modules.md, CLAUDE.md, and tasks/CONTRACTS.md. All module branches are already merged to main. Add @PreAuthorize to all controllers, create AuthenticationFacade, and replace userId request params with SecurityContext lookups exactly as specified.
```

**notification-01 — Notification Entity + Service**
```
Read tasks/notification/notification-01-entity-service.md, CLAUDE.md, and tasks/CONTRACTS.md, then create the Notification entity, NotificationService, and NotificationController exactly as specified.
```

**notification-02 — WebSocket Push**
```
Read tasks/notification/notification-02-websocket.md, CLAUDE.md, and tasks/CONTRACTS.md, then configure WebSocket/STOMP and wire BookingService and TicketService to push notifications exactly as specified.
```

**notification-03 — Notification Frontend**
```
Read tasks/notification/notification-03-frontend.md, CLAUDE.md, and tasks/CONTRACTS.md, then build the notification bell, dropdown panel, and real-time WebSocket subscription exactly as specified.
```
