-- Users
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (1, 'Admin User', 'admin@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (2, 'John Student', 'john@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (3, 'Jane Student', 'jane@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (4, 'Tech Mike', 'mike@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);

-- Resources
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (1, 'Main Hall A', 'Large lecture hall with projector and sound system', 'LECTURE_HALL', 'Building A, Floor 1', 'AVAILABLE', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (2, 'Computer Lab 3', '30 workstations with development tools installed', 'LAB', 'Building B, Floor 2', 'AVAILABLE', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (3, 'Meeting Room C', 'Small meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building A, Floor 3', 'AVAILABLE', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (4, 'Science Lab 1', 'Chemistry lab with fume hoods and safety equipment', 'LAB', 'Building C, Floor 1', 'AVAILABLE', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (5, 'Seminar Room D', 'Medium seminar room with smart board', 'SEMINAR_ROOM', 'Building A, Floor 2', 'AVAILABLE', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (6, 'Projector Kit #1', 'Portable projector with HDMI and wireless casting', 'EQUIPMENT', 'Equipment Room, Floor 1', 'AVAILABLE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (7, 'Conference Room E', 'Executive conference room with video wall', 'MEETING_ROOM', 'Building D, Floor 1', 'AVAILABLE', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at)
VALUES (8, 'Workshop Space F', 'Open workshop area with tools and workbenches', 'WORKSHOP', 'Building C, Floor 2', 'AVAILABLE', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Bookings
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (1, 1, 2, 'IT3030 Lecture - Distributed Systems', '2026-10-24 10:00:00', '2026-10-24 12:00:00', 'APPROVED', CURRENT_TIMESTAMP);
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (2, 2, 3, 'Programming Lab Session - React Workshop', '2026-10-25 14:00:00', '2026-10-25 16:00:00', 'PENDING', CURRENT_TIMESTAMP);
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (3, 3, 2, 'Study Group Meeting - Database Design', '2026-10-20 11:00:00', '2026-10-20 12:30:00', 'REJECTED', CURRENT_TIMESTAMP);
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (4, 5, 4, 'Seminar on Cloud Architecture', '2026-10-28 09:00:00', '2026-10-28 11:00:00', 'APPROVED', CURRENT_TIMESTAMP);
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (5, 7, 3, 'Project Team Sync - Smart Campus', '2026-10-30 13:00:00', '2026-10-30 14:00:00', 'PENDING', CURRENT_TIMESTAMP);
INSERT INTO bookings (id, resource_id, user_id, purpose, start_time, end_time, status, created_at)
VALUES (6, 4, 2, 'Chemistry Practical - Organic Synthesis', '2026-11-01 10:00:00', '2026-11-01 13:00:00', 'APPROVED', CURRENT_TIMESTAMP);
