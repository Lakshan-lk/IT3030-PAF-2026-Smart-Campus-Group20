# Progress — Smart Campus Operations Hub

Each module folder is a separate branch / team member.
Modules are independent — build without auth first.
Auth module wires security last (auth-04).

---

## Setup (do first, shared)
- [x] setup/setup-01 — MySQL migration
- [ ] setup/setup-02 — GitHub Actions CI

---

## Resource Module — Member 1 (independent branch)
- [x] resource/resource-01 — Equipment entity + repository + EquipmentController
- [x] resource/resource-02 — ResourceService + ResourceResponseDTO + status enum
- [x] resource/resource-03 — Availability filter endpoint (equipment, type, capacity, time slot)
- [ ] resource/resource-04 — Frontend: FacilitiesPage + admin resource/equipment CRUD

---

## Booking Module — Member 2 / Lakshika (independent branch)
- [x] booking/booking-01 — Booking entity enhancements (attendees, rejectionReason, recurrence fields)
- [x] booking/booking-02 — Recurring booking creation + series conflict detection
- [x] booking/booking-03 — Approve/reject (with reason) + cancel single + cancel series
- [ ] booking/booking-04 — Frontend: booking form with filters, user bookings page, admin bookings page

---

## Ticket Module — Member 3 (independent branch)
- [ ] ticket/ticket-01 — Ticket + TicketAttachment entities + repositories
- [ ] ticket/ticket-02 — TicketService + TicketController (CRUD + assign + status workflow)
- [ ] ticket/ticket-03 — File upload: multipart handler + static file serving
- [ ] ticket/ticket-04 — Comment entity + CommentService + CommentController
- [ ] ticket/ticket-05 — Frontend: tickets list, ticket detail, image upload, comments

---

## Auth + Notification Module — Member 4 (independent branch)
- [ ] auth/auth-01 — JWT provider + JwtAuthFilter
- [ ] auth/auth-02 — SecurityConfig + Google OAuth2 flow + token redirect
- [ ] auth/auth-03 — Frontend: AuthContext, login page, protected routes, axios JWT interceptor
- [ ] auth/auth-04 — Wire auth to all modules (@PreAuthorize + read userId from SecurityContext)
- [ ] notification/notification-01 — Notification entity + NotificationService (create/list/markRead)
- [ ] notification/notification-02 — WebSocket config + STOMP push on booking/ticket events
- [ ] notification/notification-03 — Frontend: notification bell, panel, unread badge, mark-read
