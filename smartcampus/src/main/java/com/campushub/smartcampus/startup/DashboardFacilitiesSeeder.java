package com.campushub.smartcampus.startup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class DashboardFacilitiesSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DashboardFacilitiesSeeder.class);

    private final DataSource dataSource;

    public DashboardFacilitiesSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource("db/migration/V5__seed_dashboard_facilities.sql"));
        try {
            populator.execute(dataSource);
            log.info("Dashboard facilities seed applied.");
        } catch (Exception ex) {
            log.warn("Dashboard facilities seed could not be applied: {}", ex.getMessage());
        }
    }
}
