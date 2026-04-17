# Task booking-01 — Booking Entity Enhancements

## Goal
Add missing fields to the Booking entity — `attendees`, `rejectionReason`, and all recurrence fields — so the rest of the booking module can be built on a complete schema.

## Prerequisite
setup-01

## Context
- `entity/Booking.java` — currently missing `attendees`, `rejectionReason`, and all recurrence fields
- `dto/BookingRequestDTO.java` — add corresponding fields
- `dto/BookingResponseDTO.java` — add corresponding fields
- `enums/BookingStatus.java` — check it has PENDING, APPROVED, REJECTED, CANCELLED (already present)
- DB schema target: see `tasks/CONTRACTS.md § DB: bookings`

## What to build
- `entity/Booking.java` (modify)
- `dto/BookingRequestDTO.java` (modify)
- `dto/BookingResponseDTO.java` (modify)

## Steps
1. Add to `Booking` entity:
   - `attendees` (Integer, nullable)
   - `rejectionReason` (String, max 500, nullable)
   - `isRecurring` (boolean, default false) — column name `is_recurring`
   - `recurrenceGroupId` (String, max 36, nullable) — stores UUID; column `recurrence_group_id`
   - `recurrencePattern` (String, max 20, nullable) — e.g. "WEEKLY"; column `recurrence_pattern`
   - `recurrenceEndDate` (LocalDate, nullable) — column `recurrence_end_date`
   - `skipDates` (String, column type TEXT, nullable) — comma-separated ISO dates like "2026-04-25,2026-05-02"; column `skip_dates`
2. Add matching fields to `BookingRequestDTO`:
   - `attendees` (Integer)
   - `recurring` (boolean)
   - `recurrencePattern` (String)
   - `recurrenceEndDate` (LocalDate)
   - `skipDates` (List\<String\>)
   - Keep existing: `resourceId`, `userId`, `purpose`, `startTime`, `endTime`
3. Add matching fields to `BookingResponseDTO`:
   - `attendees`, `rejectionReason`, `isRecurring`, `recurrenceGroupId`, `recurrenceEndDate`
   - Update `fromEntity(Booking b)` static method to populate these.
4. Update `BookingRequestDTO.toEntity(...)` static method to set `attendees` and `isRecurring` on the new entity. Recurrence group/pattern/endDate/skipDates are set in the service (booking-02), not here.

## Verification
```bash
cd smartcampus && ./mvnw spring-boot:run
```
Check `bookings` table in MySQL: `DESCRIBE bookings;` — should show `attendees`, `rejection_reason`, `is_recurring`, `recurrence_group_id`, `recurrence_pattern`, `recurrence_end_date`, `skip_dates` columns.

```bash
curl -X POST http://localhost:8080/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"resourceId":1,"userId":1,"purpose":"Test","attendees":10,"startTime":"2026-05-01T09:00:00","endTime":"2026-05-01T11:00:00","recurring":false}'
# → 201 with attendees:10, isRecurring:false in response
```

## When done
Mark `- [x] booking/booking-01` in `tasks/PROGRESS.md`.
