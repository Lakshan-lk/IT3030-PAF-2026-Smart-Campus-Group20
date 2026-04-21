# Task booking-02 — Recurring Booking Creation + Series Conflict Detection

## Goal
When a booking request has `recurring=true`, create one booking row per weekly occurrence (sharing a `recurrenceGroupId`), but only if ALL dates are conflict-free. Reject the entire series if any date conflicts.

## Prerequisite
booking-01

## Context
- `service/BookingService.java` — `createBooking` method handles single bookings; extend it here
- `repository/BookingRepository.java` — conflict check query already exists: `findByResourceIdAndStartTimeBeforeAndEndTimeAfter`
- Recurrence rules: weekly (same day of week), custom end date, skip specific dates
- All-or-nothing: if any occurrence conflicts → throw `BookingConflictException`, save nothing
- Data model: all occurrences share `recurrence_group_id` (UUID), each is its own row
- See `tasks/CONTRACTS.md § DB: bookings` for field names

## What to build
- `service/BookingService.java` (modify) — add `createRecurringBookings(BookingRequestDTO dto)` private helper; update `createBooking` to branch on `dto.isRecurring()`
- `repository/BookingRepository.java` (modify) — add method to find all by group
- `controller/BookingController.java` — no change needed; `createBooking` endpoint handles both

## Steps
1. Add to `BookingRepository`:
   ```java
   List<Booking> findByRecurrenceGroupId(String recurrenceGroupId);
   ```
2. In `BookingService.createBooking(BookingRequestDTO dto)`:
   - If `dto.isRecurring()` is true → call `createRecurringBookings(dto)`
   - Otherwise → existing single-booking logic (unchanged)
3. Implement `createRecurringBookings(BookingRequestDTO dto)`:
   a. Validate: `recurrenceEndDate` must be after `startTime.toLocalDate()`. `recurrencePattern` must be "WEEKLY".
   b. Generate all occurrence dates:
      - Start from `dto.getStartTime().toLocalDate()`
      - Advance by 7 days each iteration until `> recurrenceEndDate`
      - Skip any date that appears in `dto.getSkipDates()` list
      - Build list of `(LocalDateTime start, LocalDateTime end)` pairs preserving the original time-of-day
   c. Conflict check ALL occurrences first (do not save yet):
      - For each occurrence, call the existing `checkForConflict(resourceId, start, end, null)`
      - If any conflict found → throw `BookingConflictException` with message including the conflicting date
   d. Generate one UUID for the group: `UUID.randomUUID().toString()`
   e. Save all occurrences in a single loop:
      - Each Booking: set all standard fields + `isRecurring=true`, `recurrenceGroupId=uuid`, `recurrencePattern="WEEKLY"`, `recurrenceEndDate`, `skipDates` (comma-join the skip list)
   f. Return list of `BookingResponseDTO` — controller currently returns single DTO; change endpoint return type to `Object` or add a new endpoint `POST /api/v1/bookings/series` that returns `List<BookingResponseDTO>`.
      - Simplest: keep `POST /api/v1/bookings` returning `List<BookingResponseDTO>` when recurring (controller checks `dto.isRecurring()`).

## Verification
```bash
# Weekly booking every Thursday for 4 weeks, skip April 30
curl -X POST http://localhost:8080/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId":1,"userId":1,"purpose":"Weekly standup",
    "attendees":5,
    "startTime":"2026-04-23T10:00:00","endTime":"2026-04-23T11:00:00",
    "recurring":true,"recurrencePattern":"WEEKLY",
    "recurrenceEndDate":"2026-05-14",
    "skipDates":["2026-04-30"]
  }'
# → 201 with array of 3 bookings (Apr 23, May 7, May 14), all sharing recurrenceGroupId
# Apr 30 skipped

# Try same slot again — should conflict on first date
curl -X POST http://localhost:8080/api/v1/bookings \
  -d '{"resourceId":1,"userId":2,...same times...,"recurring":false}'
# → 409 conflict error
```

## When done
Mark `- [x] booking/booking-02` in `tasks/PROGRESS.md`.
