-- Allow resource rows to use the expanded status lifecycle.
-- The application now supports ACTIVE, UNDER_MAINTENANCE, and OUT_OF_SERVICE.

ALTER TABLE resources
DROP CONSTRAINT IF EXISTS resources_status_check;

ALTER TABLE resources
ADD CONSTRAINT resources_status_check
CHECK (status IN ('ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'));
