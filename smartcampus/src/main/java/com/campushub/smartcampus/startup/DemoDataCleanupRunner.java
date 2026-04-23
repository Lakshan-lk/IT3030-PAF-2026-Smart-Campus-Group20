package com.campushub.smartcampus.startup;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataCleanupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataCleanupRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public DemoDataCleanupRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // Remove the legacy demo records that were previously seeded into Supabase.
        // This is idempotent and skips tables that do not exist in the live schema.
        deleteInOrder("comments", "ticket_id", List.of(1L, 2L, 3L, 4L, 5L, 6L));
        deleteInOrder("ticket_attachments", "ticket_id", List.of(1L, 2L, 3L, 4L, 5L, 6L));
        deleteInOrder("tickets", "id", List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L));
        deleteInOrder("bookings", "id", List.of(1L, 2L, 3L, 4L, 5L, 6L));
        deleteInOrder("notifications", "id", List.of(1L, 2L, 3L, 4L, 5L, 6L));
        deleteInOrder("users", "id", List.of(1L, 2L, 3L, 4L, 5L, 6L));
        log.info("Legacy demo data cleanup completed.");
    }

    private void deleteInOrder(String table, String column, List<Long> ids) {
        if (ids.isEmpty()) {
            return;
        }

        if (!tableExists(table)) {
            log.debug("Skipping cleanup for missing table '{}'", table);
            return;
        }

        String placeholders = String.join(",", ids.stream().map(id -> "?").toList());
        String sql = "DELETE FROM " + table + " WHERE " + column + " IN (" + placeholders + ")";
        try {
            jdbcTemplate.update(sql, ids.toArray());
        } catch (Exception ex) {
            log.warn("Skipping cleanup for table '{}' due to SQL error: {}", table, ex.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
            "select count(*) from information_schema.tables where table_schema = 'public' and table_name = ?",
            Integer.class,
            tableName
        );
        return count != null && count > 0;
    }
}
