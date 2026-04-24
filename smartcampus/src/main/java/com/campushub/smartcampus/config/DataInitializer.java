package com.campushub.smartcampus.config;

import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository) {
        return args -> {
            List<User> admins = userRepository.findByRoleIn(List.of("ADMIN", "admin"));
            if (admins.isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@campus.lk");
                admin.setRole("ADMIN");
                admin.setProvider("LOCAL");
                userRepository.save(admin);
                log.info("Created default admin user: admin@campus.lk");
            } else {
                log.info("Admin users exist: {}", admins.size());
            }
        };
    }
}