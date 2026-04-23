-- V8__allow_workshop_on_enum_resource_type.sql
-- If resources.type is backed by a PostgreSQL enum, ensure WORKSHOP is added.

DO $$
DECLARE
    udt_name text;
BEGIN
    SELECT c.udt_name
      INTO udt_name
      FROM information_schema.columns c
     WHERE c.table_schema = 'public'
       AND c.table_name = 'resources'
       AND c.column_name = 'type';

    IF udt_name IS NOT NULL AND udt_name NOT IN ('varchar', 'text', 'bpchar') THEN
        EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''WORKSHOP''', udt_name);
    END IF;
END $$;
