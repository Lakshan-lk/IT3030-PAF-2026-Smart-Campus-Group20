-- V14: Allow new TicketCategory and ResourceStatus enum values in the database
-- PostgreSQL stores enums as text with CHECK constraints — Hibernate handles this via @Enumerated(EnumType.STRING)
-- No DDL changes needed for the enums themselves since they are stored as VARCHAR/TEXT.
-- This migration documents the new valid values added:
--   TicketCategory: CLEANING, ELECTRICAL, PLUMBING, HVAC, STRUCTURAL_DAMAGE, EQUIPMENT_MISSING,
--                   SOFTWARE_BUG, HARDWARE_FAILURE, SECURITY_CONCERN, NOISE_COMPLAINT, PEST_CONTROL, OTHER
--   ResourceStatus: UNDER_MAINTENANCE
-- Equipment.status is a plain VARCHAR column so no migration needed there either.
SELECT 1; -- no-op placeholder
