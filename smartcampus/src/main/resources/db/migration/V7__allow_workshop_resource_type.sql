-- V7__allow_workshop_resource_type.sql
-- Ensure resources.type check constraint includes WORKSHOP so dashboard seeding succeeds.

DO $$
DECLARE
    c RECORD;
BEGIN
    FOR c IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'resources'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%type%'
    LOOP
        EXECUTE format('ALTER TABLE resources DROP CONSTRAINT %I', c.conname);
    END LOOP;

    ALTER TABLE resources
        ADD CONSTRAINT resources_type_check
        CHECK (type IN ('LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'WORKSHOP'));
END $$;
