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
