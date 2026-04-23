-- V5__seed_dashboard_facilities.sql
-- Normalize the user-facing facility set to 4 lecture halls, 4 labs, 4 meeting rooms, and 4 workshops.

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (1, 'LEC101', 'Lecture hall with tiered seating and presentation tools', 'LECTURE_HALL', 'Building A, Floor 1', 'ACTIVE', false, 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (2, 'LEC102', 'Lecture hall for large classes and seminars', 'LECTURE_HALL', 'Building A, Floor 2', 'ACTIVE', false, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (3, 'LEC103', 'Lecture hall with projector wall and voice reinforcement', 'LECTURE_HALL', 'Building A, Floor 3', 'ACTIVE', false, 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (4, 'LEC104', 'Compact lecture hall for shorter sessions', 'LECTURE_HALL', 'Building B, Floor 1', 'ACTIVE', false, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (5, 'LAB101', 'Computer lab with development workstations', 'LAB', 'Building B, Floor 2', 'ACTIVE', false, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (6, 'LAB102', 'Computer lab for programming and systems work', 'LAB', 'Building B, Floor 3', 'ACTIVE', false, 28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (7, 'LAB103', 'Computer lab with collaborative seating', 'LAB', 'Building C, Floor 1', 'ACTIVE', false, 32, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (8, 'LAB104', 'Computer lab with mixed teaching stations', 'LAB', 'Building C, Floor 2', 'ACTIVE', false, 26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (9, 'MTR101', 'Meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building C, Floor 3', 'ACTIVE', false, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (10, 'MTR102', 'Meeting room with projector and audio support', 'MEETING_ROOM', 'Building D, Floor 1', 'ACTIVE', false, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (11, 'MTR103', 'Meeting room with smart display and camera', 'MEETING_ROOM', 'Building D, Floor 2', 'ACTIVE', false, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (12, 'MTR104', 'Meeting room for quick team huddles', 'MEETING_ROOM', 'Building D, Floor 3', 'ACTIVE', false, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (13, 'WKS101', 'Workshop space with workbenches and tools', 'WORKSHOP', 'Building E, Floor 1', 'ACTIVE', false, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (14, 'WKS102', 'Workshop space with fabrication benches', 'WORKSHOP', 'Building E, Floor 2', 'ACTIVE', false, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (15, 'WKS103', 'Workshop space for robotics and prototyping', 'WORKSHOP', 'Building E, Floor 3', 'ACTIVE', false, 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (16, 'WKS104', 'Workshop space with flexible group tables', 'WORKSHOP', 'Building F, Floor 1', 'ACTIVE', false, 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

INSERT INTO equipment (id, name, type, status, room_id) VALUES (1, 'LEC101 Projector', 'PROJECTOR', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (2, 'LEC101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (3, 'LEC101 AC Unit', 'AC', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (4, 'LEC102 Projector', 'PROJECTOR', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (5, 'LEC102 Wireless Mic', 'MICROPHONE', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (6, 'LEC102 Camera', 'CAMERA', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (7, 'LEC102 AC Unit', 'AC', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (8, 'LEC103 Projector', 'PROJECTOR', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (9, 'LEC103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (10, 'LEC103 Wireless Mic', 'MICROPHONE', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (11, 'LEC103 AC Unit', 'AC', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (12, 'LEC104 Projector', 'PROJECTOR', 'ACTIVE', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (13, 'LEC104 Camera', 'CAMERA', 'ACTIVE', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (14, 'LEC104 AC Unit', 'AC', 'ACTIVE', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (15, 'LAB101 PC', 'PC', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (16, 'LAB101 Projector', 'PROJECTOR', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (17, 'LAB101 AC Unit', 'AC', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (18, 'LAB102 PC', 'PC', 'ACTIVE', 6) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (19, 'LAB102 Whiteboard', 'WHITEBOARD', 'ACTIVE', 6) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (20, 'LAB102 AC Unit', 'AC', 'ACTIVE', 6) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (21, 'LAB103 PC', 'PC', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (22, 'LAB103 Mic Set', 'MICROPHONE', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (23, 'LAB103 Camera', 'CAMERA', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (24, 'LAB103 AC Unit', 'AC', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (25, 'LAB104 PC', 'PC', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (26, 'LAB104 Projector', 'PROJECTOR', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (27, 'LAB104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (28, 'LAB104 AC Unit', 'AC', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (29, 'MTR101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 9) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (30, 'MTR101 Camera', 'CAMERA', 'ACTIVE', 9) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (31, 'MTR101 AC Unit', 'AC', 'ACTIVE', 9) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (32, 'MTR102 Projector', 'PROJECTOR', 'ACTIVE', 10) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (33, 'MTR102 Mic Set', 'MICROPHONE', 'ACTIVE', 10) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (34, 'MTR102 AC Unit', 'AC', 'ACTIVE', 10) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (35, 'MTR103 Projector', 'PROJECTOR', 'ACTIVE', 11) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (36, 'MTR103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 11) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (37, 'MTR103 Camera', 'CAMERA', 'ACTIVE', 11) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (38, 'MTR103 AC Unit', 'AC', 'ACTIVE', 11) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (39, 'MTR104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 12) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (40, 'MTR104 Mic Set', 'MICROPHONE', 'ACTIVE', 12) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (41, 'MTR104 AC Unit', 'AC', 'ACTIVE', 12) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (42, 'WKS101 PC', 'PC', 'ACTIVE', 13) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (43, 'WKS101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 13) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (44, 'WKS101 AC Unit', 'AC', 'ACTIVE', 13) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (45, 'WKS102 PC', 'PC', 'ACTIVE', 14) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (46, 'WKS102 Projector', 'PROJECTOR', 'ACTIVE', 14) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (47, 'WKS102 AC Unit', 'AC', 'ACTIVE', 14) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (48, 'WKS103 PC', 'PC', 'ACTIVE', 15) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (49, 'WKS103 Mic Set', 'MICROPHONE', 'ACTIVE', 15) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (50, 'WKS103 Camera', 'CAMERA', 'ACTIVE', 15) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (51, 'WKS103 AC Unit', 'AC', 'ACTIVE', 15) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (52, 'WKS104 PC', 'PC', 'ACTIVE', 16) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (53, 'WKS104 Projector', 'PROJECTOR', 'ACTIVE', 16) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (54, 'WKS104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 16) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (55, 'WKS104 Mic Set', 'MICROPHONE', 'ACTIVE', 16) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (56, 'WKS104 AC Unit', 'AC', 'ACTIVE', 16) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;

-- Rebuild equipment for dashboard rooms so filtering is reliable.
-- Rules enforced:
-- 1) Every room has at least 3 equipment records
-- 2) LEC101 has MICROPHONE + PROJECTOR + WHITEBOARD
-- 3) All labs have PCs and mixed random-like MICROPHONE/PROJECTOR combos
DELETE FROM equipment WHERE room_id BETWEEN 1 AND 16;

INSERT INTO equipment (id, name, type, status, room_id) VALUES
-- Lecture halls
(1001, 'LEC101 Main Projector', 'PROJECTOR', 'ACTIVE', 1),
(1002, 'LEC101 Wireless Mic', 'MICROPHONE', 'ACTIVE', 1),
(1003, 'LEC101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 1),
(1004, 'LEC101 AC Unit', 'AC', 'ACTIVE', 1),

(1005, 'LEC102 Main Projector', 'PROJECTOR', 'ACTIVE', 2),
(1006, 'LEC102 Wireless Mic', 'MICROPHONE', 'ACTIVE', 2),
(1007, 'LEC102 Camera', 'CAMERA', 'ACTIVE', 2),
(1008, 'LEC102 AC Unit', 'AC', 'ACTIVE', 2),

(1009, 'LEC103 Main Projector', 'PROJECTOR', 'ACTIVE', 3),
(1010, 'LEC103 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 3),
(1011, 'LEC103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 3),
(1012, 'LEC103 AC Unit', 'AC', 'ACTIVE', 3),

(1013, 'LEC104 Main Projector', 'PROJECTOR', 'ACTIVE', 4),
(1014, 'LEC104 Wireless Mic', 'MICROPHONE', 'ACTIVE', 4),
(1015, 'LEC104 Camera', 'CAMERA', 'ACTIVE', 4),

-- Labs (all labs include PCs)
(1016, 'LAB101 PC Cluster A', 'PC', 'ACTIVE', 5),
(1017, 'LAB101 PC Cluster B', 'PC', 'ACTIVE', 5),
(1018, 'LAB101 Instructor Projector', 'PROJECTOR', 'ACTIVE', 5),
(1019, 'LAB101 Wireless Mic', 'MICROPHONE', 'ACTIVE', 5),

(1020, 'LAB102 PC Cluster A', 'PC', 'ACTIVE', 6),
(1021, 'LAB102 PC Cluster B', 'PC', 'ACTIVE', 6),
(1022, 'LAB102 Instructor Projector', 'PROJECTOR', 'ACTIVE', 6),

(1023, 'LAB103 PC Cluster A', 'PC', 'ACTIVE', 7),
(1024, 'LAB103 PC Cluster B', 'PC', 'ACTIVE', 7),
(1025, 'LAB103 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 7),
(1026, 'LAB103 AC Unit', 'AC', 'ACTIVE', 7),

(1027, 'LAB104 PC Cluster A', 'PC', 'ACTIVE', 8),
(1028, 'LAB104 PC Cluster B', 'PC', 'ACTIVE', 8),
(1029, 'LAB104 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 8),
(1030, 'LAB104 Instructor Projector', 'PROJECTOR', 'ACTIVE', 8),

-- Meeting rooms
(1031, 'MTR101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 9),
(1032, 'MTR101 Conference Camera', 'CAMERA', 'ACTIVE', 9),
(1033, 'MTR101 Table Mic', 'MICROPHONE', 'ACTIVE', 9),

(1034, 'MTR102 Projector', 'PROJECTOR', 'ACTIVE', 10),
(1035, 'MTR102 Table Mic', 'MICROPHONE', 'ACTIVE', 10),
(1036, 'MTR102 AC Unit', 'AC', 'ACTIVE', 10),

(1037, 'MTR103 Projector', 'PROJECTOR', 'ACTIVE', 11),
(1038, 'MTR103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 11),
(1039, 'MTR103 Conference Camera', 'CAMERA', 'ACTIVE', 11),

(1040, 'MTR104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 12),
(1041, 'MTR104 Table Mic', 'MICROPHONE', 'ACTIVE', 12),
(1042, 'MTR104 AC Unit', 'AC', 'ACTIVE', 12),

-- Workshops
(1043, 'WKS101 Workstation PC', 'PC', 'ACTIVE', 13),
(1044, 'WKS101 Projector', 'PROJECTOR', 'ACTIVE', 13),
(1045, 'WKS101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 13),

(1046, 'WKS102 Workstation PC', 'PC', 'ACTIVE', 14),
(1047, 'WKS102 Projector', 'PROJECTOR', 'ACTIVE', 14),
(1048, 'WKS102 Wireless Mic', 'MICROPHONE', 'ACTIVE', 14),

(1049, 'WKS103 Workstation PC', 'PC', 'ACTIVE', 15),
(1050, 'WKS103 Camera', 'CAMERA', 'ACTIVE', 15),
(1051, 'WKS103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 15),

(1052, 'WKS104 Workstation PC', 'PC', 'ACTIVE', 16),
(1053, 'WKS104 Projector', 'PROJECTOR', 'ACTIVE', 16),
(1054, 'WKS104 Wireless Mic', 'MICROPHONE', 'ACTIVE', 16),
(1055, 'WKS104 AC Unit', 'AC', 'ACTIVE', 16)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    room_id = EXCLUDED.room_id;
