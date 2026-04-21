# Task notification-03 — Notification Frontend (Bell + Panel + Real-Time)

## Goal
Add a notification bell icon to the navbar with an unread badge, a dropdown panel listing notifications, real-time updates via WebSocket, and mark-read functionality.

## Prerequisite
notification-01, notification-02, auth-03 (JWT in frontend)

## Context
- `frontend-web/src/components/Navbar.jsx` — add bell icon here
- `frontend-web/src/api/axios.js` — base axios
- `frontend-web/src/context/AuthContext.jsx` — `useAuth()` provides `token` and `user`
- Need SockJS + STOMP client: install `@stomp/stompjs` and `sockjs-client`

## What to build
- `frontend-web/src/api/notificationApi.js` (new)
- `frontend-web/src/hooks/useNotifications.js` (new)
- `frontend-web/src/components/NotificationBell.jsx` (new)
- `frontend-web/src/components/NotificationPanel.jsx` (new)
- `frontend-web/src/components/Navbar.jsx` (modify) — include `NotificationBell`

## Steps
1. Install deps:
   ```bash
   cd frontend-web && npm install @stomp/stompjs sockjs-client
   ```
2. `notificationApi.js`: `getNotifications()`, `markAsRead(id)`, `markAllAsRead()`.
3. `useNotifications.js` hook:
   - State: `notifications` (array), `unreadCount` (number)
   - On mount: fetch `getNotifications()` → populate state
   - WebSocket: create `StompClient` with `brokerURL: ws://localhost:8080/ws?token=<token from localStorage>`; subscribe `/user/queue/notifications`; on message: prepend to `notifications`, increment `unreadCount`
   - `markRead(id)`: call API + update state
   - `markAllRead()`: call API + set all `isRead=true` in state, `unreadCount=0`
   - Disconnect on unmount
4. `NotificationBell.jsx`:
   - Bell icon (use any icon lib or SVG)
   - Red badge showing `unreadCount` (hidden when 0)
   - Toggle `NotificationPanel` open/close on click
5. `NotificationPanel.jsx`:
   - Floating dropdown positioned below bell
   - Header: "Notifications" + "Mark all read" button
   - List of notification items: icon by type (booking/ticket), message text, timestamp (relative: "2 min ago"), unread items highlighted
   - Click notification → navigate to relevant page (`/bookings` or `/tickets`) + mark as read
   - "No notifications" empty state
6. `Navbar.jsx`: place `<NotificationBell />` in the right section, next to user avatar.

## Verification
1. Login → bell appears with badge "0"
2. In backend: approve a booking → WebSocket pushes notification → badge increments to "1" in real time (no page refresh)
3. Click bell → panel opens with the notification
4. Click notification → navigates to `/bookings`, badge clears
5. "Mark all read" → all items grey, badge disappears

## When done
Mark `- [x] notification/notification-03` in `tasks/PROGRESS.md`.
