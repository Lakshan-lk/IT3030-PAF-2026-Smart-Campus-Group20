-- V13: Add equipment_id column to tickets table for equipment-linked tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS equipment_id BIGINT;
ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS fk_ticket_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL;
