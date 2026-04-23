ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS additional_equipment_request TEXT;
