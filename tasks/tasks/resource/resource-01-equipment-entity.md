# Task resource-01 — Equipment Entity + Repository + Controller

## Goal
Add Equipment as a first-class entity fixed to a room, with full CRUD endpoints so admin can manage equipment per room.

## Prerequisite
setup-01 (MySQL running)

## Context
- Existing `Resource` entity at `com.campushub.smartcampus.entity.Resource` — Equipment links to it via FK
- Existing `ResourceController` at `com.campushub.smartcampus.controller.ResourceController`
- Package: `com.campushub.smartcampus`
- DB schema: see `tasks/CONTRACTS.md § DB: equipment`

## What to build
- `entity/Equipment.java` (new)
- `enums/EquipmentType.java` (new)
- `repository/EquipmentRepository.java` (new)
- `dto/EquipmentRequestDTO.java` (new)
- `dto/EquipmentDTO.java` (new)
- `controller/EquipmentController.java` (new)

## Steps
1. Create `EquipmentType` enum: `PROJECTOR`, `WHITEBOARD`, `AC`, `MICROPHONE`, `PC`, `CAMERA`.
2. Create `Equipment` entity:
   - Fields: `id` (Long PK), `name` (String, NotBlank, max 100), `type` (EquipmentType, Enumerated STRING), `status` (String, default "ACTIVE"), `room` (ManyToOne LAZY, JoinColumn `room_id`)
   - `@Table(name = "equipment")`
3. Create `EquipmentRepository extends JpaRepository<Equipment, Long>`:
   - `List<Equipment> findByRoomId(Long roomId)`
   - `List<Equipment> findByRoomIdAndType(Long roomId, EquipmentType type)`
4. Create `EquipmentRequestDTO`: fields `name`, `type` (String), `status`.
5. Create `EquipmentDTO`: fields `id`, `name`, `type`, `status`, `roomId`. Add static `fromEntity(Equipment e)`.
6. Create `EquipmentController` at `@RequestMapping("/api/v1")`:
   - `GET /resources/{roomId}/equipment` → `List<EquipmentDTO>` (200)
   - `POST /resources/{roomId}/equipment` → `EquipmentDTO` (201) — validate room exists, parse `type` string to enum
   - `PUT /equipment/{id}` → `EquipmentDTO` (200)
   - `DELETE /equipment/{id}` → 204
   - No `@PreAuthorize` yet — auth-04 adds it.
   - Use `EntityNotFoundException` for missing room/equipment (GlobalExceptionHandler already handles it).

## Verification
```bash
# Create a resource first (id=1 assumed from data.sql)
curl -X POST http://localhost:8080/api/v1/resources/1/equipment \
  -H "Content-Type: application/json" \
  -d '{"name":"Projector #1","type":"PROJECTOR","status":"ACTIVE"}'
# → 201 with id

curl http://localhost:8080/api/v1/resources/1/equipment
# → list with one item
```

## When done
Mark `- [x] resource/resource-01` in `tasks/PROGRESS.md`.
