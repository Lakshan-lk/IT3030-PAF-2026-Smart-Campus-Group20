# Task notification-02 — WebSocket Config + Real-Time Push

## Goal
Configure STOMP over WebSocket so the backend can push notifications to individual users in real time, and wire BookingService + TicketService to call NotificationService and then push via WebSocket.

## Prerequisite
notification-01; booking-01..03 merged; ticket-01..02 merged

## Context
- `spring-boot-starter-websocket` already in `pom.xml`
- `NotificationService` from notification-01
- `BookingService` at `com.campushub.smartcampus.service.BookingService`
- `TicketService` at `com.campushub.smartcampus.service.TicketService`
- WebSocket contract: see `tasks/CONTRACTS.md § WebSocket`

## What to build
- `config/WebSocketConfig.java` (new)
- `security/WebSocketHandshakeInterceptor.java` (new) — parse JWT from query param
- `service/NotificationService.java` (modify) — add `pushToUser(Long userId, NotificationDTO dto)` method
- `service/BookingService.java` (modify) — inject NotificationService, fire notifications
- `service/TicketService.java` (modify) — inject NotificationService, fire notifications

## Steps
1. `WebSocketConfig` (`@Configuration @EnableWebSocketMessageBroker`):
   - `registerStompEndpoints`: add `/ws`, enable SockJS, add `WebSocketHandshakeInterceptor`
   - `configureMessageBroker`: enable simple broker on `/topic`, `/user`; app destination prefix `/app`
   - `configureClientInboundChannel`: add `ChannelInterceptor` that reads JWT from session attributes (set by handshake interceptor) and sets `SecurityContextHolder`
2. `WebSocketHandshakeInterceptor implements HandshakeInterceptor`:
   - `beforeHandshake`: extract `token` query param from request; validate with `JwtTokenProvider`; if valid: put `userId` and `email` in `attributes` map (these become WebSocket session attributes)
3. In `NotificationService`, inject `SimpMessagingTemplate`:
   - Add `pushToUser(Long userId, NotificationDTO dto)`: call `messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", dto)`
   - Update `createNotification(...)` to call `pushToUser` after saving
4. **BookingService** — inject `NotificationService`. Add notification calls:
   - `approveBooking(id)`: after saving, `notificationService.createNotification(booking.getUser().getId(), BOOKING_APPROVED, "Your booking for " + resourceName + " was approved.", bookingId, "BOOKING")`
   - `rejectBooking(id, reason)`: fire `BOOKING_REJECTED` notification
   - `cancelBooking(id)`: fire `BOOKING_CANCELLED` notification to the booking owner
5. **TicketService** — inject `NotificationService`. Add:
   - `updateStatus(...)`: fire `TICKET_STATUS_CHANGED` to ticket creator
   - `assignTicket(...)`: fire `TICKET_ASSIGNED` to ticket creator
6. **CommentService** — inject `NotificationService`. Add:
   - `addComment(...)`: if commenter is not the ticket owner, fire `TICKET_COMMENT_ADDED` to ticket owner

## Verification
1. Open browser console on React app, connect to WebSocket manually:
   ```js
   const client = new StompJs.Client({ brokerURL: 'ws://localhost:8080/ws?token=<jwt>' })
   client.onConnect = () => client.subscribe('/user/queue/notifications', m => console.log(m.body))
   client.activate()
   ```
2. In another window: approve a booking owned by that user
3. Console prints JSON notification: `{type:"BOOKING_APPROVED", message:"...", isRead:false}`

## When done
Mark `- [x] notification/notification-02` in `tasks/PROGRESS.md`.
