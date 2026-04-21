# Task booking-03 — Approve / Reject (with reason) + Cancel Single + Cancel Series

## Goal
Fix and complete the booking workflow: reject must accept a reason, cancel must work on APPROVED bookings too, and a new endpoint cancels an entire recurring series.

## Prerequisite
booking-01, booking-02

## Context
- `service/BookingService.java` — `rejectBooking` currently takes no reason param; `cancelBooking` incorrectly blocks cancelling APPROVED bookings
- `controller/BookingController.java` — `rejectBooking` takes no body; needs `POST /api/v1/bookings/series/{groupId}/cancel`
- See `tasks/CONTRACTS.md § Booking API` for endpoint shapes

## What to build
- `service/BookingService.java` (modify)
- `controller/BookingController.java` (modify)
- `dto/RejectBookingRequestDTO.java` (new) — `{ "reason": "..." }`

## Steps
1. Create `RejectBookingRequestDTO` with single field `reason` (String, NotBlank).
2. Fix `BookingService.rejectBooking(Long id)` → `rejectBooking(Long id, String reason)`:
   - Set `booking.setRejectionReason(reason)` before saving.
3. Fix `BookingService.cancelBooking(Long id)`:
   - **Remove** the check `if (booking.getStatus() == BookingStatus.APPROVED) throw ...`
   - APPROVED bookings **can** be cancelled (assignment spec: "Approved bookings can later be CANCELLED")
   - Keep: cannot cancel if `startTime` is in the past.
   - Cannot cancel already CANCELLED or REJECTED bookings.
4. Add `BookingService.cancelSeries(String groupId)`:
   - Find all bookings with `recurrenceGroupId = groupId`
   - For each that is PENDING or APPROVED and `startTime` is in the future: set status = CANCELLED
   - Save all, return count of cancelled.
5. Update `BookingController.rejectBooking` to accept `@RequestBody RejectBookingRequestDTO dto` and pass `dto.getReason()` to service.
6. Add to `BookingController`:
   ```
   POST /api/v1/bookings/series/{groupId}/cancel → 200 with { "cancelled": N }
   ```

## Verification
```bash
# Approve booking id=1
curl -X PUT http://localhost:8080/api/v1/bookings/1/approve
# → status: APPROVED

# Cancel the approved booking
curl -X POST http://localhost:8080/api/v1/bookings/1/cancel
# → status: CANCELLED (not an error)

# Reject with reason
curl -X PUT http://localhost:8080/api/v1/bookings/2/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Room under maintenance"}'
# → status: REJECTED, rejectionReason: "Room under maintenance"

# Cancel entire series
curl -X POST http://localhost:8080/api/v1/bookings/series/<uuid>/cancel
# → {"cancelled": 3}
```

## When done
Mark `- [x] booking/booking-03` in `tasks/PROGRESS.md`.
