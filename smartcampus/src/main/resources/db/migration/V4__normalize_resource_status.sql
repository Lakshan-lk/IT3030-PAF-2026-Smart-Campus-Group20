-- V4__normalize_resource_status.sql
-- Normalize legacy resource statuses to the enum values used by the application.

UPDATE resources
SET status = 'ACTIVE'
WHERE status = 'AVAILABLE';
