package com.campushub.smartcampus.startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Drops the resources_type_check constraint on startup so that all valid ResourceType
 * enum values (including WORKSHOP) can be saved without hitting a DB-level check violation.
 * This runner is ordered to run BEFORE the seeder runners.
 */
@Component
@Order(1)
public class ResourceTypeConstraintDropRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ResourceTypeConstraintDropRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public ResourceTypeConstraintDropRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_type_check");
            log.info("resources_type_check constraint dropped (or was already absent).");
        } catch (Exception e) {
            log.warn("Could not drop resources_type_check constraint: {}", e.getMessage());
        }
    }
}
