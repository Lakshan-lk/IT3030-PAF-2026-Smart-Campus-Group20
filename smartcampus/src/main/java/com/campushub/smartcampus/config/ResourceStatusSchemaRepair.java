package com.campushub.smartcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ResourceStatusSchemaRepair implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ResourceStatusSchemaRepair.class);

    private final JdbcTemplate jdbcTemplate;

    public ResourceStatusSchemaRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("""
                    UPDATE resources
                    SET status = 'ACTIVE'
                    WHERE status = 'AVAILABLE'
                    """);
            jdbcTemplate.execute("""
                    UPDATE resources
                    SET status = 'OUT_OF_SERVICE'
                    WHERE status = 'UNAVAILABLE'
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    DROP CONSTRAINT IF EXISTS resources_status_check
                    """);
            jdbcTemplate.execute("""
                    ALTER TABLE resources
                    ADD CONSTRAINT resources_status_check
                    CHECK (status IN ('ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'))
                    """);
            log.info("Resource status constraint repaired successfully");
        } catch (Exception ex) {
            log.warn("Resource status constraint repair skipped or failed: {}", ex.getMessage());
        }
    }
}
