-- V6__seed_minimum_room_equipment.sql
-- Ensure every dashboard room has at least 3 equipment items.
-- Rules:
-- 1) LEC101 includes MICROPHONE + PROJECTOR + WHITEBOARD
-- 2) All LAB rooms include PCs, with random-like MICROPHONE/PROJECTOR additions
-- 3) Every room has >= 3 equipment rows

DELETE FROM equipment WHERE room_id BETWEEN 1 AND 16;

-- LECTURE HALLS
INSERT INTO equipment (id, name, type, status, room_id) VALUES
(101, 'LEC101 Main Projector', 'PROJECTOR', 'ACTIVE', 1),
(102, 'LEC101 Wireless Mic', 'MICROPHONE', 'ACTIVE', 1),
(103, 'LEC101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 1),
(104, 'LEC101 Camera', 'CAMERA', 'ACTIVE', 1),

(105, 'LEC102 Main Projector', 'PROJECTOR', 'ACTIVE', 2),
(106, 'LEC102 Wireless Mic', 'MICROPHONE', 'ACTIVE', 2),
(107, 'LEC102 Whiteboard', 'WHITEBOARD', 'ACTIVE', 2),

(108, 'LEC103 Main Projector', 'PROJECTOR', 'ACTIVE', 3),
(109, 'LEC103 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 3),
(110, 'LEC103 Camera', 'CAMERA', 'ACTIVE', 3),

(111, 'LEC104 Main Projector', 'PROJECTOR', 'ACTIVE', 4),
(112, 'LEC104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 4),
(113, 'LEC104 Wireless Mic', 'MICROPHONE', 'ACTIVE', 4)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
type = EXCLUDED.type,
status = EXCLUDED.status,
room_id = EXCLUDED.room_id;

-- LABS (all labs include PCs)
INSERT INTO equipment (id, name, type, status, room_id) VALUES
(114, 'LAB101 PC Cluster A', 'PC', 'ACTIVE', 5),
(115, 'LAB101 PC Cluster B', 'PC', 'ACTIVE', 5),
(116, 'LAB101 Instructor Projector', 'PROJECTOR', 'ACTIVE', 5),
(117, 'LAB101 Wireless Mic', 'MICROPHONE', 'ACTIVE', 5),

(118, 'LAB102 PC Cluster A', 'PC', 'ACTIVE', 6),
(119, 'LAB102 PC Cluster B', 'PC', 'ACTIVE', 6),
(120, 'LAB102 Whiteboard', 'WHITEBOARD', 'ACTIVE', 6),
(121, 'LAB102 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 6),

(122, 'LAB103 PC Cluster A', 'PC', 'ACTIVE', 7),
(123, 'LAB103 PC Cluster B', 'PC', 'ACTIVE', 7),
(124, 'LAB103 Instructor Projector', 'PROJECTOR', 'ACTIVE', 7),
(125, 'LAB103 Camera', 'CAMERA', 'ACTIVE', 7),

(126, 'LAB104 PC Cluster A', 'PC', 'ACTIVE', 8),
(127, 'LAB104 PC Cluster B', 'PC', 'ACTIVE', 8),
(128, 'LAB104 Ceiling Mic', 'MICROPHONE', 'ACTIVE', 8),
(129, 'LAB104 Instructor Projector', 'PROJECTOR', 'ACTIVE', 8)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
type = EXCLUDED.type,
status = EXCLUDED.status,
room_id = EXCLUDED.room_id;

-- MEETING ROOMS
INSERT INTO equipment (id, name, type, status, room_id) VALUES
(130, 'MTR101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 9),
(131, 'MTR101 Conference Camera', 'CAMERA', 'ACTIVE', 9),
(132, 'MTR101 Table Mic', 'MICROPHONE', 'ACTIVE', 9),

(133, 'MTR102 Projector', 'PROJECTOR', 'ACTIVE', 10),
(134, 'MTR102 Table Mic', 'MICROPHONE', 'ACTIVE', 10),
(135, 'MTR102 Whiteboard', 'WHITEBOARD', 'ACTIVE', 10),

(136, 'MTR103 Projector', 'PROJECTOR', 'ACTIVE', 11),
(137, 'MTR103 Conference Camera', 'CAMERA', 'ACTIVE', 11),
(138, 'MTR103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 11),

(139, 'MTR104 Whiteboard', 'WHITEBOARD', 'ACTIVE', 12),
(140, 'MTR104 Table Mic', 'MICROPHONE', 'ACTIVE', 12),
(141, 'MTR104 Conference Camera', 'CAMERA', 'ACTIVE', 12)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
type = EXCLUDED.type,
status = EXCLUDED.status,
room_id = EXCLUDED.room_id;

-- WORKSHOPS
INSERT INTO equipment (id, name, type, status, room_id) VALUES
(142, 'WKS101 Workstation PC', 'PC', 'ACTIVE', 13),
(143, 'WKS101 Whiteboard', 'WHITEBOARD', 'ACTIVE', 13),
(144, 'WKS101 Projector', 'PROJECTOR', 'ACTIVE', 13),

(145, 'WKS102 Workstation PC', 'PC', 'ACTIVE', 14),
(146, 'WKS102 Projector', 'PROJECTOR', 'ACTIVE', 14),
(147, 'WKS102 Wireless Mic', 'MICROPHONE', 'ACTIVE', 14),

(148, 'WKS103 Workstation PC', 'PC', 'ACTIVE', 15),
(149, 'WKS103 Camera', 'CAMERA', 'ACTIVE', 15),
(150, 'WKS103 Whiteboard', 'WHITEBOARD', 'ACTIVE', 15),

(151, 'WKS104 Workstation PC', 'PC', 'ACTIVE', 16),
(152, 'WKS104 Projector', 'PROJECTOR', 'ACTIVE', 16),
(153, 'WKS104 Wireless Mic', 'MICROPHONE', 'ACTIVE', 16),
(154, 'WKS104 Camera', 'CAMERA', 'ACTIVE', 16)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
type = EXCLUDED.type,
status = EXCLUDED.status,
room_id = EXCLUDED.room_id;
