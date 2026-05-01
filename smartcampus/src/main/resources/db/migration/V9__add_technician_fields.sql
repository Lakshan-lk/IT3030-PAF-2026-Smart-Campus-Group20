-- V9__add_technician_fields.sql
-- Add fields for local technician login

ALTER TABLE users ADD COLUMN username VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN password VARCHAR(255);
ALTER TABLE users ADD COLUMN profession VARCHAR(255);
