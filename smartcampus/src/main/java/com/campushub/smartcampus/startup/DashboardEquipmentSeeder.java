package com.campushub.smartcampus.startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DashboardEquipmentSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DashboardEquipmentSeeder.class);

    private final JdbcTemplate jdbcTemplate;

    public DashboardEquipmentSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!tableExists("equipment") || !tableExists("resources")) {
            log.warn("Skipping equipment seeding because required tables are missing.");
            return;
        }

        Set<Long> existingRoomIds = jdbcTemplate.queryForList(
                "SELECT id FROM resources WHERE id BETWEEN 1 AND 16",
                Long.class
        ).stream().collect(Collectors.toSet());

        if (existingRoomIds.isEmpty()) {
            log.warn("Skipping equipment seeding because no dashboard rooms (1..16) exist.");
            return;
        }

        jdbcTemplate.update("DELETE FROM equipment WHERE room_id BETWEEN 1 AND 16");

        List<EquipmentSeed> seeds = List.of(
                // Lecture halls
                new EquipmentSeed(2001L, "LEC101 Main Projector", "PROJECTOR", "ACTIVE", 1L),
                new EquipmentSeed(2002L, "LEC101 Wireless Mic", "MICROPHONE", "ACTIVE", 1L),
                new EquipmentSeed(2003L, "LEC101 Whiteboard", "WHITEBOARD", "ACTIVE", 1L),
                new EquipmentSeed(2004L, "LEC101 AC Unit", "AC", "ACTIVE", 1L),

                new EquipmentSeed(2005L, "LEC102 Main Projector", "PROJECTOR", "ACTIVE", 2L),
                new EquipmentSeed(2006L, "LEC102 Wireless Mic", "MICROPHONE", "ACTIVE", 2L),
                new EquipmentSeed(2007L, "LEC102 Camera", "CAMERA", "ACTIVE", 2L),
                new EquipmentSeed(2008L, "LEC102 AC Unit", "AC", "ACTIVE", 2L),

                new EquipmentSeed(2009L, "LEC103 Main Projector", "PROJECTOR", "ACTIVE", 3L),
                new EquipmentSeed(2010L, "LEC103 Ceiling Mic", "MICROPHONE", "ACTIVE", 3L),
                new EquipmentSeed(2011L, "LEC103 Whiteboard", "WHITEBOARD", "ACTIVE", 3L),
                new EquipmentSeed(2012L, "LEC103 AC Unit", "AC", "ACTIVE", 3L),

                new EquipmentSeed(2013L, "LEC104 Main Projector", "PROJECTOR", "ACTIVE", 4L),
                new EquipmentSeed(2014L, "LEC104 Wireless Mic", "MICROPHONE", "ACTIVE", 4L),
                new EquipmentSeed(2015L, "LEC104 Camera", "CAMERA", "ACTIVE", 4L),

                // Labs (all labs include PCs)
                new EquipmentSeed(2016L, "LAB101 PC Cluster A", "PC", "ACTIVE", 5L),
                new EquipmentSeed(2017L, "LAB101 PC Cluster B", "PC", "ACTIVE", 5L),
                new EquipmentSeed(2018L, "LAB101 Instructor Projector", "PROJECTOR", "ACTIVE", 5L),
                new EquipmentSeed(2019L, "LAB101 Wireless Mic", "MICROPHONE", "ACTIVE", 5L),

                new EquipmentSeed(2020L, "LAB102 PC Cluster A", "PC", "ACTIVE", 6L),
                new EquipmentSeed(2021L, "LAB102 PC Cluster B", "PC", "ACTIVE", 6L),
                new EquipmentSeed(2022L, "LAB102 Instructor Projector", "PROJECTOR", "ACTIVE", 6L),

                new EquipmentSeed(2023L, "LAB103 PC Cluster A", "PC", "ACTIVE", 7L),
                new EquipmentSeed(2024L, "LAB103 PC Cluster B", "PC", "ACTIVE", 7L),
                new EquipmentSeed(2025L, "LAB103 Ceiling Mic", "MICROPHONE", "ACTIVE", 7L),
                new EquipmentSeed(2026L, "LAB103 AC Unit", "AC", "ACTIVE", 7L),

                new EquipmentSeed(2027L, "LAB104 PC Cluster A", "PC", "ACTIVE", 8L),
                new EquipmentSeed(2028L, "LAB104 PC Cluster B", "PC", "ACTIVE", 8L),
                new EquipmentSeed(2029L, "LAB104 Ceiling Mic", "MICROPHONE", "ACTIVE", 8L),
                new EquipmentSeed(2030L, "LAB104 Instructor Projector", "PROJECTOR", "ACTIVE", 8L),

                // Meeting rooms
                new EquipmentSeed(2031L, "MTR101 Whiteboard", "WHITEBOARD", "ACTIVE", 9L),
                new EquipmentSeed(2032L, "MTR101 Conference Camera", "CAMERA", "ACTIVE", 9L),
                new EquipmentSeed(2033L, "MTR101 Table Mic", "MICROPHONE", "ACTIVE", 9L),

                new EquipmentSeed(2034L, "MTR102 Projector", "PROJECTOR", "ACTIVE", 10L),
                new EquipmentSeed(2035L, "MTR102 Table Mic", "MICROPHONE", "ACTIVE", 10L),
                new EquipmentSeed(2036L, "MTR102 AC Unit", "AC", "ACTIVE", 10L),

                new EquipmentSeed(2037L, "MTR103 Projector", "PROJECTOR", "ACTIVE", 11L),
                new EquipmentSeed(2038L, "MTR103 Whiteboard", "WHITEBOARD", "ACTIVE", 11L),
                new EquipmentSeed(2039L, "MTR103 Conference Camera", "CAMERA", "ACTIVE", 11L),

                new EquipmentSeed(2040L, "MTR104 Whiteboard", "WHITEBOARD", "ACTIVE", 12L),
                new EquipmentSeed(2041L, "MTR104 Table Mic", "MICROPHONE", "ACTIVE", 12L),
                new EquipmentSeed(2042L, "MTR104 AC Unit", "AC", "ACTIVE", 12L),

                // Workshops
                new EquipmentSeed(2043L, "WKS101 Workstation PC", "PC", "ACTIVE", 13L),
                new EquipmentSeed(2044L, "WKS101 Projector", "PROJECTOR", "ACTIVE", 13L),
                new EquipmentSeed(2045L, "WKS101 Whiteboard", "WHITEBOARD", "ACTIVE", 13L),

                new EquipmentSeed(2046L, "WKS102 Workstation PC", "PC", "ACTIVE", 14L),
                new EquipmentSeed(2047L, "WKS102 Projector", "PROJECTOR", "ACTIVE", 14L),
                new EquipmentSeed(2048L, "WKS102 Wireless Mic", "MICROPHONE", "ACTIVE", 14L),

                new EquipmentSeed(2049L, "WKS103 Workstation PC", "PC", "ACTIVE", 15L),
                new EquipmentSeed(2050L, "WKS103 Camera", "CAMERA", "ACTIVE", 15L),
                new EquipmentSeed(2051L, "WKS103 Whiteboard", "WHITEBOARD", "ACTIVE", 15L),

                new EquipmentSeed(2052L, "WKS104 Workstation PC", "PC", "ACTIVE", 16L),
                new EquipmentSeed(2053L, "WKS104 Projector", "PROJECTOR", "ACTIVE", 16L),
                new EquipmentSeed(2054L, "WKS104 Wireless Mic", "MICROPHONE", "ACTIVE", 16L),
                new EquipmentSeed(2055L, "WKS104 AC Unit", "AC", "ACTIVE", 16L)
        );

        final String upsertSql = """
                INSERT INTO equipment (id, name, type, status, room_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    type = EXCLUDED.type,
                    status = EXCLUDED.status,
                    room_id = EXCLUDED.room_id
                """;

        int inserted = 0;
        for (EquipmentSeed seed : seeds) {
            if (!existingRoomIds.contains(seed.roomId())) {
                continue;
            }
            jdbcTemplate.update(upsertSql, seed.id(), seed.name(), seed.type(), seed.status(), seed.roomId());
            inserted++;
        }

        log.info("Dashboard equipment seed applied. {} equipment rows upserted.", inserted);
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_schema = 'public' and table_name = ?",
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private record EquipmentSeed(Long id, String name, String type, String status, Long roomId) {}
}
