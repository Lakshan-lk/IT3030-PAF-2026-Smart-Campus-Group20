# Task resource-03 — Availability Filter Endpoint

## Goal
Add query filters to `GET /api/v1/resources` so the booking form can show only rooms that match a user's requirements: equipment type, room type, minimum capacity, and availability in a time slot.

## Prerequisite
resource-01, resource-02

## Context
- `ResourceService` at `com.campushub.smartcampus.service.ResourceService` — add filtered query method
- `ResourceRepository` at `com.campushub.smartcampus.repository.ResourceRepository`
- `BookingRepository` at `com.campushub.smartcampus.repository.BookingRepository` — needed for slot availability check
- `EquipmentRepository` at `com.campushub.smartcampus.repository.EquipmentRepository`
- Filter params (see `tasks/CONTRACTS.md § Resource API`): `type`, `capacity`, `hasEquipment`, `startTime`, `endTime`, `status`

## What to build
- `ResourceRepository` (modify) — add custom query
- `ResourceService` (modify) — add `getAvailableResources(...)` method
- `ResourceController` (modify) — pass all filter params to service

## Steps
1. Add to `ResourceRepository`:
   ```java
   // Rooms that have at least one equipment of the given type
   @Query("SELECT DISTINCT r FROM Resource r JOIN r.equipment e WHERE e.type = :type")
   List<Resource> findByEquipmentType(@Param("type") EquipmentType type);
   ```
   Note: this requires `Resource` to have a `@OneToMany(mappedBy = "room")` collection `equipment`. Add it to `Resource` entity if not present.
2. Add to `ResourceService`:
   - `getAvailableResources(String type, Integer minCapacity, String hasEquipment, LocalDateTime startTime, LocalDateTime endTime)`:
     1. Start with all ACTIVE resources.
     2. Filter by `type` if provided.
     3. Filter by `capacity >= minCapacity` if provided.
     4. Filter by equipment type if `hasEquipment` provided (use `EquipmentRepository.findByRoomId` or the new repo query).
     5. If `startTime` + `endTime` provided: exclude rooms that have a PENDING or APPROVED booking overlapping the slot. Use `BookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(resourceId, endTime, startTime)` — already exists. Build set of conflicted IDs, then filter.
3. Update `ResourceController.getAllResources` to accept `@RequestParam(required=false) String hasEquipment`, `@RequestParam(required=false) LocalDateTime startTime`, `@RequestParam(required=false) LocalDateTime endTime` and pass all to service.

## Verification
```bash
# Rooms with a projector available on 2026-05-01 09:00–11:00
curl "http://localhost:8080/api/v1/resources?hasEquipment=PROJECTOR&startTime=2026-05-01T09:00:00&endTime=2026-05-01T11:00:00"
# → only rooms with projector that have no conflicting booking
```

## When done
Mark `- [x] resource/resource-03` in `tasks/PROGRESS.md`.
