-- V3__seed_facilities.sql
-- Seed the current facilities and their equipment for the facilities and bookings pages.

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at)
VALUES (1, 'Main Hall A', 'Large lecture hall with projector and sound system', 'LECTURE_HALL', 'Building A, Floor 1', 'ACTIVE', false, 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (2, 'Computer Lab 3', '30 workstations with development tools installed', 'LAB', 'Building B, Floor 2', 'ACTIVE', false, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (3, 'Meeting Room C', 'Small meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building A, Floor 3', 'ACTIVE', false, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (4, 'Science Lab 1', 'Chemistry lab with fume hoods and safety equipment', 'LAB', 'Building C, Floor 1', 'ACTIVE', false, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (5, 'Seminar Room D', 'Medium seminar room with smart board', 'MEETING_ROOM', 'Building A, Floor 2', 'ACTIVE', false, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (6, 'Projector Kit #1', 'Portable projector with HDMI and wireless casting', 'LAB', 'Equipment Room, Floor 1', 'ACTIVE', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (7, 'Conference Room E', 'Executive conference room with video wall', 'MEETING_ROOM', 'Building D, Floor 1', 'ACTIVE', false, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (8, 'Workshop Space F', 'Open workshop area with tools and workbenches', 'LAB', 'Building C, Floor 2', 'ACTIVE', false, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (9, 'Audio Visual Kit #2', 'Portable PA system with wireless microphones', 'LAB', 'Equipment Room, Floor 1', 'ACTIVE', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
VALUES (10, 'Lecture Hall B', 'Tiered lecture hall with dual projectors', 'LECTURE_HALL', 'Building B, Floor 1', 'OUT_OF_SERVICE', false, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    is_deleted = EXCLUDED.is_deleted,
    capacity = EXCLUDED.capacity,
    updated_at = EXCLUDED.updated_at;

-- EQUIPMENT
-- ============================================================
INSERT INTO equipment (id, name, type, status, room_id) VALUES (1, 'Main Projector A1', 'PROJECTOR', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (2, 'Wireless Mic Set A1', 'MICROPHONE', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (3, 'AC Unit A1', 'AC', 'ACTIVE', 1) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (4, 'Lab PC Station 1', 'PC', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (5, 'Lab PC Station 2', 'PC', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (6, 'Lab Projector B1', 'PROJECTOR', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (7, 'AC Unit B1', 'AC', 'ACTIVE', 2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (8, 'Whiteboard C1', 'WHITEBOARD', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (9, 'Video Camera C1', 'CAMERA', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (10, 'AC Unit C1', 'AC', 'ACTIVE', 3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (11, 'Fume Hood AC C1', 'AC', 'ACTIVE', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (12, 'Lab PC Station C1', 'PC', 'ACTIVE', 4) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (13, 'Smart Board D1', 'WHITEBOARD', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (14, 'Projector D1', 'PROJECTOR', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (15, 'AC Unit D1', 'AC', 'ACTIVE', 5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (16, 'Video Wall E1', 'PROJECTOR', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (17, 'Whiteboard E1', 'WHITEBOARD', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (18, 'Conference Camera E1', 'CAMERA', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (19, 'AC Unit E1', 'AC', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (20, 'Wireless Mic Set E1', 'MICROPHONE', 'ACTIVE', 7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (21, 'Workbench PC F1', 'PC', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (22, 'Workbench PC F2', 'PC', 'ACTIVE', 8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (23, 'Main Projector B1', 'PROJECTOR', 'OUT_OF_SERVICE', 10) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (24, 'Wireless Mic Set B1', 'MICROPHONE', 'OUT_OF_SERVICE', 10) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, status = EXCLUDED.status, room_id = EXCLUDED.room_id;
