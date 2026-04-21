# Task auth-04 — Wire Auth to All Modules

## Goal
After all module branches are merged to main, replace `userId` request-body params with `SecurityContext` lookups and add `@PreAuthorize` to every controller. This task is done once, by the auth member.

## Prerequisite
auth-02 must be merged. All module backends (resource-01..03, booking-01..03, ticket-01..04, notification-01) must be merged to main.

## Context
- `SecurityConfig` already set up from auth-02
- Controllers: `ResourceController`, `EquipmentController`, `BookingController`, `TicketController`, `CommentController`, `NotificationController`
- Services: `BookingService`, `TicketService`, `CommentService`
- `JwtAuthFilter` populates `SecurityContextHolder` with `UsernamePasswordAuthenticationToken`
- To get current user in a service/controller: inject `AuthenticationFacade` or use `SecurityContextHolder.getContext().getAuthentication()` directly

## What to build
- `security/AuthenticationFacade.java` (new) — thin wrapper to get current authenticated user
- All controllers (modify) — add `@PreAuthorize`
- Services that take `userId` param (modify) — replace with `authFacade.getCurrentUser()`

## Steps
1. Create `AuthenticationFacade` (`@Component`):
   - `getCurrentUser()` → loads `User` from `UserRepository` using email from `SecurityContextHolder`. Returns `User`.
   - `getCurrentUserId()` → returns `Long`
   - `hasRole(String role)` → boolean
2. **BookingController**: Remove `userId` from `BookingRequestDTO` (keep field but mark deprecated or remove). In `BookingService.createBooking`, replace `dto.getUserId()` with `authFacade.getCurrentUserId()`. Add:
   - `@PreAuthorize("isAuthenticated()")` on `createBooking`, `updateBooking`, `cancelBooking`, `getBookingById`
   - `@PreAuthorize("hasRole('ADMIN')")` on `approveBooking`, `rejectBooking`, `deleteBooking`, `getActiveBookingsCount`
   - `GET /` logic: if ADMIN → all bookings; if USER → only their own (use `authFacade` to check role)
3. **ResourceController / EquipmentController**: Add `@PreAuthorize("hasRole('ADMIN')")` on POST, PUT, DELETE. GET endpoints remain open to authenticated users.
4. **TicketController**: Replace `userId` in `TicketRequestDTO` with `authFacade.getCurrentUserId()`. Add:
   - `@PreAuthorize("isAuthenticated()")` on create, getById, getComments
   - `@PreAuthorize("hasRole('ADMIN')")` on assign, delete
   - `@PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")` on status update
   - `GET /` logic: ADMIN/TECH → all; USER → own
5. **CommentController**: Replace `userId` param with `authFacade.getCurrentUserId()`. Pass `authFacade.hasRole("ADMIN")` to `CommentService.deleteComment`.
6. **NotificationController**: `GET /api/v1/notifications` → `authFacade.getCurrentUserId()` to scope to current user.
7. Remove `userId` fields from request DTOs where they were only needed for pre-auth stub. Update Postman collection or tests accordingly.

## Verification
```bash
# Without token → 401
curl http://localhost:8080/api/v1/bookings

# With USER token → own bookings only
curl http://localhost:8080/api/v1/bookings -H "Authorization: Bearer <user_token>"

# USER tries to approve → 403
curl -X PUT http://localhost:8080/api/v1/bookings/1/approve -H "Authorization: Bearer <user_token>"
# → 403

# ADMIN token → approves successfully
curl -X PUT http://localhost:8080/api/v1/bookings/1/approve -H "Authorization: Bearer <admin_token>"
# → 200
```

## When done
Mark `- [x] auth/auth-04` in `tasks/PROGRESS.md`.
