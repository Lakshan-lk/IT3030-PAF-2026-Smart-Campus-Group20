# Task notification-01 — Notification Entity + Service

## Goal
Create the Notification entity, repository, service (create/list/markRead), and REST controller so other modules can trigger notifications and users can fetch them.

## Prerequisite
setup-01

## Context
- DB schema: see `tasks/CONTRACTS.md § DB: notifications`
- `entity/User.java` — Notification links to User
- Notification types: see `tasks/CONTRACTS.md § DB: notifications` (NotificationType enum values)
- Other services (BookingService, TicketService) will inject `NotificationService` to fire events — but that wiring happens after notification-01 is merged

## What to build
- `enums/NotificationType.java` (new)
- `entity/Notification.java` (new)
- `repository/NotificationRepository.java` (new)
- `dto/NotificationDTO.java` (new)
- `service/NotificationService.java` (new)
- `controller/NotificationController.java` (new)

## Steps
1. `NotificationType` enum: `BOOKING_APPROVED`, `BOOKING_REJECTED`, `BOOKING_CANCELLED`, `TICKET_STATUS_CHANGED`, `TICKET_COMMENT_ADDED`, `TICKET_ASSIGNED`.
2. `Notification` entity (`@Table(name = "notifications")`):
   - `id`, `user` ManyToOne LAZY NotNull, `type` NotificationType Enumerated STRING, `message` VARCHAR(500), `referenceId` Long nullable, `referenceType` VARCHAR(20) nullable, `isRead` boolean default false, `createdAt` (insert only)
3. `NotificationRepository extends JpaRepository<Notification, Long>`:
   - `List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId)`
   - `long countByUserIdAndIsReadFalse(Long userId)`
   - `List<Notification> findByUserIdAndIsReadFalse(Long userId)` — for mark-all-read
4. `NotificationDTO`: `id`, `type`, `message`, `referenceId`, `referenceType`, `isRead`, `createdAt`. Static `fromEntity`.
5. `NotificationService` (`@Service`):
   - `createNotification(Long userId, NotificationType type, String message, Long referenceId, String referenceType)` → save + return saved entity (other services call this)
   - `getNotifications(Long userId)` → `List<NotificationDTO>`
   - `markAsRead(Long notificationId, Long userId)` → validates ownership; sets `isRead=true`
   - `markAllAsRead(Long userId)` → batch update all unread for user
   - `getUnreadCount(Long userId)` → long
6. `NotificationController` at `/api/v1/notifications`:
   - `GET /` → `List<NotificationDTO>` (userId from request param for now; auth-04 replaces with SecurityContext)
   - `PATCH /{id}/read` → 204
   - `PATCH /read-all` → 204 (userId from request param)

## Verification
```bash
# Create a notification manually (normally triggered by other services)
# Then fetch
curl "http://localhost:8080/api/v1/notifications?userId=1"
# → empty list initially

# Mark all read
curl -X PATCH "http://localhost:8080/api/v1/notifications/read-all?userId=1"
# → 204
```

## When done
Mark `- [x] notification/notification-01` in `tasks/PROGRESS.md`.
