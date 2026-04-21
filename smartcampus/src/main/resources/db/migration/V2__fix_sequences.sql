-- Reset all sequences to be safely above seeded/existing data
SELECT setval('bookings_seq',  GREATEST((SELECT COALESCE(MAX(id), 0) FROM bookings),  100));
SELECT setval('users_seq',     GREATEST((SELECT COALESCE(MAX(id), 0) FROM users),     100));
SELECT setval('resources_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM resources), 100));
SELECT setval('equipment_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM equipment), 100));
SELECT setval('tickets_seq',   GREATEST((SELECT COALESCE(MAX(id), 0) FROM tickets),   100));
