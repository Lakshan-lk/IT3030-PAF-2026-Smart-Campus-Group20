ALTER TABLE equipment
    ALTER COLUMN room_id DROP NOT NULL;

ALTER TABLE equipment
    ALTER COLUMN type DROP NOT NULL;

ALTER TABLE equipment
    ADD COLUMN is_hiring_equipment BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN hire_type VARCHAR(120),
    ADD COLUMN description VARCHAR(1000);

CREATE TABLE equipment_images (
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL
);
