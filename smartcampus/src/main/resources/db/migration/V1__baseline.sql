-- V1__baseline.sql
-- Smart Campus baseline migration

-- Users table
CREATE TABLE users (
    id BIGINT NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    provider VARCHAR(20),
    provider_id VARCHAR(255),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- Resources table
CREATE TABLE resources (
    id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(30) NOT NULL,
    location VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    capacity INT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Equipment table
CREATE TABLE equipment (
    id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    room_id BIGINT NOT NULL REFERENCES resources(id),
    PRIMARY KEY (id)
);

-- Bookings table
CREATE TABLE bookings (
    id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL REFERENCES resources(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    purpose VARCHAR(500) NOT NULL,
    attendees INT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    rejection_reason VARCHAR(500),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_group_id VARCHAR(36),
    recurrence_pattern VARCHAR(20),
    recurrence_end_date DATE,
    skip_dates TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Tickets table
CREATE TABLE tickets (
    id BIGINT NOT NULL,
    room_id BIGINT REFERENCES resources(id),
    equipment_id BIGINT REFERENCES equipment(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_to BIGINT REFERENCES users(id),
    resolution_notes TEXT,
    rejection_reason VARCHAR(500),
    preferred_contact VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Ticket attachments table
CREATE TABLE ticket_attachments (
    id BIGINT NOT NULL,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Comments table
CREATE TABLE comments (
    id BIGINT NOT NULL,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(40) NOT NULL,
    message VARCHAR(500) NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Sequences
CREATE SEQUENCE IF NOT EXISTS users_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS resources_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS equipment_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS bookings_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS tickets_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS ticket_attachments_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS comments_seq START WITH 100;
CREATE SEQUENCE IF NOT EXISTS notifications_seq START WITH 100;

-- Seed data
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (1, 'Admin User', 'admin@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (2, 'John Student', 'john@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (3, 'Jane Student', 'jane@campus.edu', 'USER', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (4, 'Tech Mike', 'mike@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (5, 'Sarah Admin', 'sarah@campus.edu', 'ADMIN', 'LOCAL', CURRENT_TIMESTAMP);
INSERT INTO users (id, name, email, role, provider, created_at) VALUES (6, 'Tom Technician', 'tom@campus.edu', 'TECHNICIAN', 'LOCAL', CURRENT_TIMESTAMP);

INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (1, 'Main Hall A', 'Large lecture hall with projector and sound system', 'LECTURE_HALL', 'Building A, Floor 1', 'AVAILABLE', false, 200, '/images/facilities/lecture-hall.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (2, 'Computer Lab 3', '30 workstations with development tools installed', 'LAB', 'Building B, Floor 2', 'AVAILABLE', false, 30, '/images/facilities/lab.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (3, 'Meeting Room C', 'Small meeting room with whiteboard and video conferencing', 'MEETING_ROOM', 'Building A, Floor 3', 'AVAILABLE', false, 10, '/images/facilities/meeting-room.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (4, 'Science Lab 1', 'Chemistry lab with fume hoods and safety equipment', 'LAB', 'Building C, Floor 1', 'AVAILABLE', false, 25, '/images/facilities/lab.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (5, 'Seminar Room D', 'Medium seminar room with smart board', 'MEETING_ROOM', 'Building A, Floor 2', 'AVAILABLE', false, 40, '/images/facilities/meeting-room.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (6, 'Projector Kit #1', 'Portable projector with HDMI and wireless casting', 'LAB', 'Equipment Room, Floor 1', 'AVAILABLE', false, 1, '/images/facilities/equipment-kit.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (7, 'Conference Room E', 'Executive conference room with video wall', 'MEETING_ROOM', 'Building D, Floor 1', 'AVAILABLE', false, 20, '/images/facilities/meeting-room.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (8, 'Workshop Space F', 'Open workshop area with tools and workbenches', 'LAB', 'Building C, Floor 2', 'AVAILABLE', false, 15, '/images/facilities/workshop.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (9, 'Audio Visual Kit #2', 'Portable PA system with wireless microphones', 'LAB', 'Equipment Room, Floor 1', 'AVAILABLE', false, 1, '/images/facilities/equipment-kit.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO resources (id, name, description, type, location, status, is_deleted, capacity, image_url, created_at, updated_at) VALUES (10, 'Lecture Hall B', 'Tiered lecture hall with dual projectors', 'LECTURE_HALL', 'Building B, Floor 1', 'OUT_OF_SERVICE', false, 150, '/images/facilities/lecture-hall.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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

INSERT INTO equipment (id, name, type, status, room_id) VALUES (1, 'Main Projector A1', 'PROJECTOR', 'ACTIVE', 1);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (2, 'Wireless Mic Set A1', 'MICROPHONE', 'ACTIVE', 1);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (3, 'AC Unit A1', 'AC', 'ACTIVE', 1);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (4, 'Lab PC Station 1', 'PC', 'ACTIVE', 2);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (5, 'Lab PC Station 2', 'PC', 'ACTIVE', 2);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (6, 'Lab Projector B1', 'PROJECTOR', 'ACTIVE', 2);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (7, 'AC Unit B1', 'AC', 'ACTIVE', 2);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (8, 'Whiteboard C1', 'WHITEBOARD', 'ACTIVE', 3);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (9, 'Video Camera C1', 'CAMERA', 'ACTIVE', 3);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (10, 'AC Unit C1', 'AC', 'ACTIVE', 3);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (11, 'Fume Hood AC C1', 'AC', 'ACTIVE', 4);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (12, 'Lab PC Station C1', 'PC', 'ACTIVE', 4);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (13, 'Smart Board D1', 'WHITEBOARD', 'ACTIVE', 5);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (14, 'Projector D1', 'PROJECTOR', 'ACTIVE', 5);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (15, 'AC Unit D1', 'AC', 'ACTIVE', 5);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (16, 'Video Wall E1', 'PROJECTOR', 'ACTIVE', 7);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (17, 'Whiteboard E1', 'WHITEBOARD', 'ACTIVE', 7);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (18, 'Conference Camera E1', 'CAMERA', 'ACTIVE', 7);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (19, 'AC Unit E1', 'AC', 'ACTIVE', 7);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (20, 'Wireless Mic Set E1', 'MICROPHONE', 'ACTIVE', 7);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (21, 'Workbench PC F1', 'PC', 'ACTIVE', 8);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (22, 'Workbench PC F2', 'PC', 'ACTIVE', 8);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (23, 'Main Projector B1', 'PROJECTOR', 'OUT_OF_SERVICE', 10);
INSERT INTO equipment (id, name, type, status, room_id) VALUES (24, 'Wireless Mic Set B1', 'MICROPHONE', 'OUT_OF_SERVICE', 10);
