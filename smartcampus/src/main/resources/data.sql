-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (1, 'Admin User', 'admin@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (2, 'John Student', 'john@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (3, 'Jane Student', 'jane@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (4, 'Tech Mike', 'mike@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (5, 'Sarah Admin', 'sarah@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (6, 'Tom Technician', 'tom@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;

-- ============================================================
-- RESOURCES
-- ============================================================
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (1, 'Main Hall A', 'Large lecture hall with projector and sound system', 'LECTURE_HALL', 'Building A, Floor 1', 'AVAILABLE', false, 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (2, 'Computer Lab 3', '30 workstations with development tools installed', 'LAB', 'Building B, Floor 2', 'AVAILABLE', false, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (3, 'Meeting Room C', 'Small meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building A, Floor 3', 'AVAILABLE', false, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (4, 'Science Lab 1', 'Chemistry lab with fume hoods and safety equipment', 'LAB', 'Building C, Floor 1', 'AVAILABLE', false, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (5, 'Seminar Room D', 'Medium seminar room with smart board', 'MEETING_ROOM', 'Building A, Floor 2', 'AVAILABLE', false, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (6, 'Projector Kit #1', 'Portable projector with HDMI and wireless casting', 'LAB', 'Equipment Room, Floor 1', 'AVAILABLE', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (7, 'Conference Room E', 'Executive conference room with video wall', 'MEETING_ROOM', 'Building D, Floor 1', 'AVAILABLE', false, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (8, 'Workshop Space F', 'Open workshop area with tools and workbenches', 'LAB', 'Building C, Floor 2', 'AVAILABLE', false, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (9, 'Audio Visual Kit #2', 'Portable PA system with wireless microphones', 'LAB', 'Equipment Room, Floor 1', 'AVAILABLE', false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, created_at, updated_at) VALUES (10, 'Lecture Hall B', 'Tiered lecture hall with dual projectors', 'LECTURE_HALL', 'Building B, Floor 1', 'OUT_OF_SERVICE', false, 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;

-- ============================================================
-- BOOKINGS
-- ============================================================
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (1, 1, 2, 'IT3030 Lecture - Distributed Systems', '2026-10-24 10:00:00', '2026-10-24 12:00:00', 'APPROVED', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (2, 2, 3, 'Programming Lab Session - React Workshop', '2026-10-25 14:00:00', '2026-10-25 16:00:00', 'PENDING', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (3, 3, 2, 'Study Group Meeting - Database Design', '2026-10-20 11:00:00', '2026-10-20 12:30:00', 'REJECTED', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (4, 5, 4, 'Seminar on Cloud Architecture', '2026-10-28 09:00:00', '2026-10-28 11:00:00', 'APPROVED', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (5, 7, 3, 'Project Team Sync - Smart Campus', '2026-10-30 13:00:00', '2026-10-30 14:00:00', 'PENDING', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at) VALUES (6, 4, 2, 'Chemistry Practical - Organic Synthesis', '2026-11-01 10:00:00', '2026-11-01 13:00:00', 'APPROVED', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;

-- ============================================================
-- EQUIPMENT
-- ============================================================
INSERT INTO equipment (id, name, type, status, room_id) VALUES (1, 'Main Projector A1', 'PROJECTOR', 'ACTIVE', 1) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (2, 'Wireless Mic Set A1', 'MICROPHONE', 'ACTIVE', 1) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (3, 'AC Unit A1', 'AC', 'ACTIVE', 1) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (4, 'Lab PC Station 1', 'PC', 'ACTIVE', 2) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (5, 'Lab PC Station 2', 'PC', 'ACTIVE', 2) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (6, 'Lab Projector B1', 'PROJECTOR', 'ACTIVE', 2) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (7, 'AC Unit B1', 'AC', 'ACTIVE', 2) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (8, 'Whiteboard C1', 'WHITEBOARD', 'ACTIVE', 3) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (9, 'Video Camera C1', 'CAMERA', 'ACTIVE', 3) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (10, 'AC Unit C1', 'AC', 'ACTIVE', 3) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (11, 'Fume Hood AC C1', 'AC', 'ACTIVE', 4) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (12, 'Lab PC Station C1', 'PC', 'ACTIVE', 4) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (13, 'Smart Board D1', 'WHITEBOARD', 'ACTIVE', 5) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (14, 'Projector D1', 'PROJECTOR', 'ACTIVE', 5) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (15, 'AC Unit D1', 'AC', 'ACTIVE', 5) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (16, 'Video Wall E1', 'PROJECTOR', 'ACTIVE', 7) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (17, 'Whiteboard E1', 'WHITEBOARD', 'ACTIVE', 7) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (18, 'Conference Camera E1', 'CAMERA', 'ACTIVE', 7) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (19, 'AC Unit E1', 'AC', 'ACTIVE', 7) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (20, 'Wireless Mic Set E1', 'MICROPHONE', 'ACTIVE', 7) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (21, 'Workbench PC F1', 'PC', 'ACTIVE', 8) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (22, 'Workbench PC F2', 'PC', 'ACTIVE', 8) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (23, 'Main Projector B1', 'PROJECTOR', 'OUT_OF_SERVICE', 10) ON CONFLICT DO NOTHING;
INSERT INTO equipment (id, name, type, status, room_id) VALUES (24, 'Wireless Mic Set B1', 'MICROPHONE', 'OUT_OF_SERVICE', 10) ON CONFLICT DO NOTHING;

-- ============================================================
-- RESET SEQUENCES above seed data max IDs
-- ============================================================
SELECT setval('resources_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM resources), 100));
SELECT setval('users_seq',     GREATEST((SELECT COALESCE(MAX(id), 0) FROM users),     100));
SELECT setval('equipment_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM equipment), 100));
SELECT setval('bookings_seq',  GREATEST((SELECT COALESCE(MAX(id), 0) FROM bookings),  100));
