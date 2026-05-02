CREATE SEQUENCE IF NOT EXISTS equipment_bookings_seq START WITH 100 INCREMENT BY 50;

CREATE TABLE equipment_bookings (
    id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    purpose VARCHAR(500) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
