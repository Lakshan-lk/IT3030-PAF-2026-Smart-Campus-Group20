-- ============================================================
-- Smart Campus Operations Hub -- Seed Data
-- Run against H2 or PostgreSQL. Execute after schema creation.
-- ============================================================

-- USERS (roles: USER, ADMIN, TECHNICIAN)
INSERT INTO users (id, name, email, role) VALUES (1, 'Admin User', 'admin@smartcampus.edu', 'ADMIN');
INSERT INTO users (id, name, email, role) VALUES (2, 'Tech Tom', 'tech@smartcampus.edu', 'TECHNICIAN');
INSERT INTO users (id, name, email, role) VALUES (3, 'Alice Student', 'alice@smartcampus.edu', 'USER');
INSERT INTO users (id, name, email, role) VALUES (4, 'Bob Student', 'bob@smartcampus.edu', 'USER');

-- RESOURCES
INSERT INTO resources (id, type, capacity, location, status) VALUES (1, 'Lecture Hall', 200, 'Building A, Floor 1', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (2, 'Lecture Hall', 120, 'Building A, Floor 2', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (3, 'Computer Lab', 40, 'Building B, Floor 1', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (4, 'Computer Lab', 40, 'Building B, Floor 2', 'MAINTENANCE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (5, 'Meeting Room', 10, 'Building A, Floor 3', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (6, 'Meeting Room', 6, 'Building C, Floor 1', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (7, 'Seminar Room', 60, 'Building C, Floor 2', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (8, 'Projector', 1, 'Equipment Room A101', 'AVAILABLE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (9, 'Projector', 1, 'Equipment Room B201', 'IN_USE');
INSERT INTO resources (id, type, capacity, location, status) VALUES (10, 'Auditorium', 500, 'Building D, Floor 1', 'AVAILABLE');

-- BOOKINGS
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, status) VALUES (1, 1, 3, '2026-04-10 10:00:00', '2026-04-10 12:00:00', 'APPROVED');
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, status) VALUES (2, 3, 4, '2026-04-11 14:00:00', '2026-04-11 16:00:00', 'PENDING');
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, status) VALUES (3, 5, 3, '2026-04-08 09:00:00', '2026-04-08 10:00:00', 'REJECTED');
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, status) VALUES (4, 7, 4, '2026-04-12 13:00:00', '2026-04-12 15:00:00', 'APPROVED');
INSERT INTO bookings (id, resource_id, user_id, start_time, end_time, status) VALUES (5, 2, 3, '2026-04-15 08:00:00', '2026-04-15 10:00:00', 'PENDING');

-- TICKETS
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (1, 1, 3, 'Projector not working in Main Hall A. The projector is continuously blinking red and fails to connect to any HDMI input.', 'HIGH', 'OPEN');
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (2, 6, 4, 'Squeaky door at main entrance of Meeting Room C. Needs oiling.', 'LOW', 'OPEN');
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (3, 3, 3, 'AC leaking water near the third desk row in Computer Lab 3. Maintenance team has been dispatched.', 'MEDIUM', 'IN_PROGRESS');
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (4, 9, 4, 'Projector lamp replacement needed. Current lamp has exceeded 3000 hours.', 'MEDIUM', 'OPEN');
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (5, 10, 3, 'Stage lighting system in Auditorium has two dead spotlights on the left side.', 'HIGH', 'IN_PROGRESS');
INSERT INTO tickets (id, resource_id, user_id, description, priority, status) VALUES (6, 4, 4, 'Three computers in Lab B201 are not booting. Possible PSU failure.', 'CRITICAL', 'OPEN');

-- NOTIFICATIONS
INSERT INTO notifications (id, user_id, message, is_read) VALUES (1, 3, 'Your booking for Main Hall A on Apr 10 has been approved.', true);
INSERT INTO notifications (id, user_id, message, is_read) VALUES (2, 4, 'Your booking for Computer Lab 3 on Apr 11 is pending approval.', false);
INSERT INTO notifications (id, user_id, message, is_read) VALUES (3, 2, 'You have been assigned ticket #TK-003: AC leaking in Lab 3.', false);
INSERT INTO notifications (id, user_id, message, is_read) VALUES (4, 3, 'Your ticket #TK-001 (Projector issue) is now open and awaiting assignment.', true);
INSERT INTO notifications (id, user_id, message, is_read) VALUES (5, 4, 'Your booking for Meeting Room C on Apr 8 was rejected: Room under maintenance.', true);

-- Reset sequences (H2 specific -- remove for PostgreSQL)
ALTER TABLE users ALTER COLUMN id RESTART WITH 5;
ALTER TABLE resources ALTER COLUMN id RESTART WITH 11;
ALTER TABLE bookings ALTER COLUMN id RESTART WITH 6;
ALTER TABLE tickets ALTER COLUMN id RESTART WITH 7;
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 6;
