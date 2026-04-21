# Task resource-02 — ResourceService + ResourceResponseDTO + Status Enum

## Goal
Refactor ResourceController to use a proper service layer, return DTOs instead of raw entities, and use a status enum (ACTIVE / OUT_OF_SERVICE).

## Prerequisite
resource-01

## Context
- `ResourceController` at `com.campushub.smartcampus.controller.ResourceController` — currently calls `resourceRepository` directly (no service). Fix this.
- `Resource` entity at `com.campushub.smartcampus.entity.Resource` — `status` field is a plain String "AVAILABLE". Change to enum.
- `ResourceRepository` at `com.campushub.smartcampus.repository.ResourceRepository`
- Existing methods: `findByNameContainingIgnoreCase`, `findByType`, `findByLocation`, `findByStatus`

## What to build
- `enums/ResourceStatus.java` (new)
- `enums/ResourceType.java` (new)
- `dto/ResourceRequestDTO.java` (new)
- `dto/ResourceResponseDTO.java` (new) — includes `List<EquipmentDTO> equipment`
- `service/ResourceService.java` (new)
- `controller/ResourceController.java` (modify) — delegate all logic to ResourceService

## Steps
1. Create `ResourceStatus` enum: `ACTIVE`, `OUT_OF_SERVICE`.
2. Create `ResourceType` enum: `LAB`, `LECTURE_HALL`, `MEETING_ROOM`.
3. Update `Resource` entity:
   - Change `status` field from `String` to `ResourceStatus` with `@Enumerated(EnumType.STRING)`, default `ACTIVE`.
   - Change `type` field to keep String but validate against `ResourceType` values in service (or change to enum — either consistent approach is fine).
4. Create `ResourceRequestDTO`: `name`, `description`, `type` (String), `location`, `status` (String), `capacity` (Integer), `imageUrl`.
5. Create `ResourceResponseDTO`: all Resource fields + `List<EquipmentDTO> equipment`. Add `fromEntity(Resource r, List<Equipment> eq)` static factory.
6. Create `ResourceService` (`@Service`):
   - `getAllResources()` → `List<ResourceResponseDTO>`
   - `getResourceById(Long id)` → `ResourceResponseDTO` (throw `EntityNotFoundException` if missing)
   - `createResource(ResourceRequestDTO dto)` → `ResourceResponseDTO`
   - `updateResource(Long id, ResourceRequestDTO dto)` → `ResourceResponseDTO`
   - `deleteResource(Long id)` — throws if not found
   - Inject `ResourceRepository` and `EquipmentRepository`; fetch equipment per resource in `fromEntity`.
7. Update `ResourceController` to inject `ResourceService` instead of `ResourceRepository`. Remove all direct repo calls.

## Verification
```bash
curl http://localhost:8080/api/v1/resources
# → list of ResourceResponseDTO with equipment array per resource

curl -X POST http://localhost:8080/api/v1/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Lab A","type":"LAB","location":"Block C","status":"ACTIVE","capacity":30}'
# → 201 with id + empty equipment array
```

## When done
Mark `- [x] resource/resource-02` in `tasks/PROGRESS.md`.
