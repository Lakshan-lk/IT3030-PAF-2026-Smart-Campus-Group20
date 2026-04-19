-- ============================================================
-- USERS
-- Roles: ADMIN, TECHNICIAN, USER
-- ============================================================
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (1, 'Admin User', 'admin@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (2, 'John Student', 'john@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (3, 'Jane Student', 'jane@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (4, 'Tech Mike', 'mike@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (5, 'Sarah Admin', 'sarah@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (6, 'Tom Technician', 'tom@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP);

-- ============================================================
-- RESOURCES
-- Types: LECTURE_HALL, LAB, MEETING_ROOM, SEMINAR_ROOM, EQUIPMENT, WORKSHOP
-- Statuses: AVAILABLE, MAINTENANCE, UNAVAILABLE
-- ============================================================
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (1, 'Main Hall A', 'Large lecture hall with projector and sound system', 'LECTURE_HALL', 'Building A, Floor 1', 'AVAILABLE', 200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (2, 'Computer Lab 3', '30 workstations with development tools installed', 'LAB', 'Building B, Floor 2', 'AVAILABLE', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (3, 'Meeting Room C', 'Small meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building A, Floor 3', 'AVAILABLE', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (4, 'Science Lab 1', 'Chemistry lab with fume hoods and safety equipment', 'LAB', 'Building C, Floor 1', 'AVAILABLE', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (5, 'Seminar Room D', 'Medium seminar room with smart board', 'SEMINAR_ROOM', 'Building A, Floor 2', 'AVAILABLE', 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (6, 'Projector Kit #1', 'Portable projector with HDMI and wireless casting', 'EQUIPMENT', 'Equipment Room, Floor 1', 'AVAILABLE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (7, 'Conference Room E', 'Executive conference room with video wall', 'MEETING_ROOM', 'Building D, Floor 1', 'AVAILABLE', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (8, 'Workshop Space F', 'Open workshop area with tools and workbenches', 'WORKSHOP', 'Building C, Floor 2', 'AVAILABLE', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (9, 'Audio Visual Kit #2', 'Portable PA system with wireless microphones', 'EQUIPMENT', 'Equipment Room, Floor 1', 'AVAILABLE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);
INSERT INTO resources (id, name, description, type, location, status, capacity, created_at, updated_at, is_deleted)
VALUES (10, 'Lecture Hall B', 'Tiered lecture hall with dual projectors', 'LECTURE_HALL', 'Building B, Floor 1', 'MAINTENANCE', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false);

-- ============================================================
-- BOOKINGS
-- Statuses: PENDING, APPROVED, REJECTED, CANCELLED
-- ============================================================
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

-- ============================================================
-- PLACEHOLDER DATA FOR OTHER MEMBERS
-- Uncomment and adjust when entities are created.
-- Foreign key references use the IDs defined above.
-- ============================================================

-- MEMBER 3: Ticket entity (when created)
-- Expected fields: id, title, description, status, priority, reporter_id (FK -> users),
--                  assigned_to (FK -> users, nullable), resource_id (FK -> resources, nullable),
--                  created_at, updated_at
--
-- Statuses: OPEN, IN_PROGRESS, RESOLVED, CLOSED
-- Priorities: LOW, MEDIUM, HIGH, CRITICAL
--
-- INSERT INTO tickets (id, title, description, status, priority, reporter_id, assigned_to, resource_id, created_at, updated_at)
-- VALUES (1, 'Projector not working in Hall A', 'The main projector in Main Hall A is flickering and won''t display properly', 'OPEN', 'HIGH', 2, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- INSERT INTO tickets (id, title, description, status, priority, reporter_id, assigned_to, resource_id, created_at, updated_at)
-- VALUES (2, 'AC leaking in Lab 3', 'Water dripping from ceiling near workstation row B', 'IN_PROGRESS', 'MEDIUM', 3, 4, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- INSERT INTO tickets (id, title, description, status, priority, reporter_id, assigned_to, resource_id, created_at, updated_at)
-- VALUES (3, 'Broken chair in Meeting Room C', 'One of the chairs has a broken wheel', 'OPEN', 'LOW', 2, NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- INSERT INTO tickets (id, title, description, status, priority, reporter_id, assigned_to, resource_id, created_at, updated_at)
-- VALUES (4, 'Fire alarm malfunction', 'Fire alarm in Building C keeps going off randomly', 'OPEN', 'CRITICAL', 3, 6, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- INSERT INTO tickets (id, title, description, status, priority, reporter_id, assigned_to, resource_id, created_at, updated_at)
-- VALUES (5, 'WiFi dead zone in Workshop F', 'No internet connectivity in the back corner of the workshop', 'IN_PROGRESS', 'MEDIUM', 2, 6, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- MEMBER 3: Attachment entity (when created)
-- Expected fields: id, ticket_id (FK -> tickets), file_name, file_type, file_size, file_url, uploaded_at
--
-- INSERT INTO attachments (id, ticket_id, file_name, file_type, file_size, file_url, uploaded_at)
-- VALUES (1, 1, 'projector-issue.jpg', 'image/jpeg', 245000, 'uploads/tickets/projector-issue.jpg', CURRENT_TIMESTAMP);
-- INSERT INTO attachments (id, ticket_id, file_name, file_type, file_size, file_url, uploaded_at)
-- VALUES (2, 2, 'ac-leak-photo.png', 'image/png', 1024000, 'uploads/tickets/ac-leak-photo.png', CURRENT_TIMESTAMP);

-- MEMBER 3: TicketComment entity (when created)
-- Expected fields: id, ticket_id (FK -> tickets), author_id (FK -> users), content, created_at
--
-- INSERT INTO ticket_comments (id, ticket_id, author_id, content, created_at)
-- VALUES (1, 1, 4, 'Checked the projector lamp. Needs replacement. Ordered new unit.', CURRENT_TIMESTAMP);
-- INSERT INTO ticket_comments (id, ticket_id, author_id, content, created_at)
-- VALUES (2, 2, 4, 'Maintenance team notified. Scheduled for tomorrow morning.', CURRENT_TIMESTAMP);
-- INSERT INTO ticket_comments (id, ticket_id, author_id, content, created_at)
-- VALUES (3, 1, 2, 'Thanks for the quick response! Let me know when it''s fixed.', CURRENT_TIMESTAMP);

-- MEMBER 4: Notification entity (when created)
-- Expected fields: id, user_id (FK -> users), message, type, is_read, read_at (nullable), created_at
--
-- Types: BOOKING_CREATED, BOOKING_APPROVED, BOOKING_REJECTED, TICKET_ASSIGNED, TICKET_UPDATED, GENERAL
--
-- INSERT INTO notifications (id, user_id, message, type, is_read, read_at, created_at)
-- VALUES (1, 2, 'Your booking for Main Hall A has been approved.', 'BOOKING_APPROVED', false, NULL, CURRENT_TIMESTAMP);
-- INSERT INTO notifications (id, user_id, message, type, is_read, read_at, created_at)
-- VALUES (2, 3, 'Your booking for Meeting Room C has been rejected.', 'BOOKING_REJECTED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- INSERT INTO notifications (id, user_id, message, type, is_read, read_at, created_at)
-- VALUES (3, 4, 'You have been assigned to ticket: Projector not working in Hall A', 'TICKET_ASSIGNED', false, NULL, CURRENT_TIMESTAMP);

ALTER TABLE resources ALTER COLUMN id RESTART WITH 100;

ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE bookings ALTER COLUMN id RESTART WITH 100;
