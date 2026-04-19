package com.campushub.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartcampusApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		System.setProperty("POSTGRES_DB", dotenv.get("POSTGRES_DB", "smartcampusdb"));
		System.setProperty("POSTGRES_USER", dotenv.get("POSTGRES_USER", "smartcampus"));
		System.setProperty("POSTGRES_PASSWORD", dotenv.get("POSTGRES_PASSWORD", ""));
		SpringApplication.run(SmartcampusApplication.class, args);
	}

}
