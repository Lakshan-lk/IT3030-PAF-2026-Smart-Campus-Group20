# Flyway Sequence Fix — Context for Agent

## Problem
Booking insert fails: `duplicate key value violates unique constraint "bookings_pkey"`.

`V1__baseline.sql` seeds bookings with explicit ids 1–6. `bookings_seq` starts at 1 (not 100 as intended — `CREATE SEQUENCE IF NOT EXISTS` was a no-op because Hibernate's `ddl-auto=update` created the sequence first at 1). So Hibernate's `nextval('bookings_seq')` returns values that collide with seeded rows.

## Current State
- **Booking entity**: uses `@GeneratedValue(SEQUENCE)` with `bookings_seq` (was `IDENTITY`, already changed)
- **Sequence**: manually reset to 100 via `SELECT setval('bookings_seq', 100, false)` — works until DB volume is wiped
- **Flyway**: configured (`spring.flyway.enabled=true`, deps in pom.xml) but `flyway_schema_history` table does NOT exist — migrations never ran
- **V2 migration exists** at `db/migration/V2__fix_sequences.sql` but has never been applied

## Root Cause of Flyway Not Running
`spring.jpa.hibernate.ddl-auto=update` creates schema on first run. On subsequent runs, Flyway likely fails silently on V1 (tables already exist) and never writes `flyway_schema_history`. The `spring.flyway.baseline-on-migrate=true` setting should handle this but something is preventing it.

## What Needs Fixing
1. **Diagnose why Flyway doesn't run** — check Spring Boot startup logs for Flyway errors; verify `flyway_schema_history` is never created
2. **Likely fix**: set `spring.flyway.baseline-version=1` and `spring.flyway.baseline-on-migrate=true` (already set) so Flyway baselines at V1 (skips it) and runs V2+. OR switch `ddl-auto` to `validate` or `none` so Flyway fully owns schema.
3. **V2 must run** to permanently fix sequences after any DB wipe:
   ```sql
   SELECT setval('bookings_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM bookings), 100));
   ```
4. **All other tables** (users, resources, equipment, tickets) have the same sequence mismatch — V2 resets all of them.

## Key Files
- `smartcampus/src/main/resources/application.properties` — Flyway + JPA config
- `smartcampus/src/main/resources/db/migration/V1__baseline.sql` — schema + seed data
- `smartcampus/src/main/resources/db/migration/V2__fix_sequences.sql` — sequence reset (not yet applied)
- `smartcampus/src/main/java/com/campushub/smartcampus/entity/Booking.java` — `@SequenceGenerator(sequenceName = "bookings_seq")`

## DB Connection
```
container: smartcampus-db
port: 5434
db: smartcampusdb
user: smartcampus
```
Connect: `docker exec smartcampus-db psql -U smartcampus -d smartcampusdb`
