# Task booking-04 — Booking Frontend

## Goal
Build the full booking UI: a smart booking form with filters + recurring options, a user's "My Bookings" page, and an admin bookings management page.

## Prerequisite
booking-01, booking-02, booking-03 (backend done)

## Context
- `frontend-web/src/pages/BookingsPage.jsx` — exists, likely skeleton
- `frontend-web/src/pages/AdminBookingsPage.jsx` — exists, likely skeleton
- `frontend-web/src/components/NewBookingForm.jsx` — exists, extend this
- `frontend-web/src/hooks/useBookings.js` — exists
- `frontend-web/src/api/bookingApi.js` — exists
- `frontend-web/src/api/axios.js` — base axios instance
- No auth yet — pass `userId: 1` hardcoded in all requests (auth-04 replaces with real userId)

## What to build
- `frontend-web/src/api/bookingApi.js` (modify) — add all missing calls
- `frontend-web/src/components/NewBookingForm.jsx` (modify) — full form with filters + recurring
- `frontend-web/src/components/BookingCard.jsx` (new) — single booking display card
- `frontend-web/src/pages/BookingsPage.jsx` (modify) — user's bookings list + "New Booking" button
- `frontend-web/src/pages/AdminBookingsPage.jsx` (modify) — all bookings table with approve/reject/cancel actions

## Steps

### bookingApi.js
Add: `createBooking(data)`, `updateBooking(id, data)`, `approveBooking(id)`, `rejectBooking(id, reason)`, `cancelBooking(id)`, `cancelSeries(groupId)`, `getBookings(params)`, `getBookingById(id)`.

### NewBookingForm.jsx
Two-step form:
1. **Step 1 — Find a room**: filter bar (room type, equipment, min capacity, date, start time, end time) → calls `GET /api/v1/resources` with those params → shows matching rooms as radio cards → user selects one.
2. **Step 2 — Booking details**: purpose (textarea), attendees (number input), recurring toggle. If recurring: show recurrenceEndDate picker + skip dates multi-picker (date inputs to add/remove). Submit → `createBooking(data)`.

### BookingCard.jsx
Shows: resource name, date/time, purpose, attendees, status badge (colour-coded), rejectionReason if REJECTED. "Cancel" button if status is PENDING or APPROVED and date is future. For recurring: show "Cancel all" link.

### BookingsPage.jsx
- Header: "My Bookings" + "New Booking" button (opens `NewBookingForm` in a modal or navigates to `/bookings/new`)
- List of `BookingCard` grouped by status (Upcoming / Past / Cancelled)
- On cancel: call `cancelBooking(id)` or `cancelSeries(groupId)` + refresh list

### AdminBookingsPage.jsx
- Table with columns: ID, User, Room, Date/Time, Attendees, Status, Actions
- Filter bar: status dropdown, resource dropdown, date range
- "Approve" button → `approveBooking(id)` → status turns green
- "Reject" button → opens inline reason input → `rejectBooking(id, reason)`
- "Cancel" button for APPROVED/PENDING
- Pagination (pass `page` + `size` params if backend supports)

## Verification
1. `npm run dev` → navigate to `/bookings`
2. Click "New Booking" → Step 1 filters load rooms → select one → Step 2 fills details → submit → card appears in list
3. Create a recurring booking (weekly, 3 weeks) → 3 cards appear with same `recurrenceGroupId`
4. Admin page: approve one → status badge turns APPROVED; reject another with reason → badge REJECTED + reason shown

## When done
Mark `- [x] booking/booking-04` in `tasks/PROGRESS.md`.
