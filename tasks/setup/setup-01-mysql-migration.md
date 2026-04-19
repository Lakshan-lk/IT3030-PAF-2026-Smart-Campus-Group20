# Task setup-01 — PostgreSQL Migration

## Goal
Replace H2 in-memory database with PostgreSQL so all modules persist data across restarts.

## Prerequisite
Docker running. Start DB: `docker compose up -d postgres`

## Context
- `smartcampus/pom.xml` — currently has `com.h2database:h2` runtime dep, no PostgreSQL driver
- `smartcampus/src/main/resources/application.properties` — H2 JDBC URL, H2 dialect, H2 console enabled
- Spring Boot 4.0.5; `spring.jpa.hibernate.ddl-auto=update` already set — keep it
- docker-compose.yml: postgres:17-alpine, db=`smartcampusdb`, user=`smartcampus`, pass=`smartcampus`, port=5432

## What to build
- `smartcampus/pom.xml` — replace H2 dep with PostgreSQL driver
- `smartcampus/src/main/resources/application.properties` — update datasource + dialect

## Steps
1. In `pom.xml`, replace:
   ```xml
   <dependency>
     <groupId>com.h2database</groupId>
     <artifactId>h2</artifactId>
     <scope>runtime</scope>
   </dependency>
   ```
   with:
   ```xml
   <dependency>
     <groupId>org.postgresql</groupId>
     <artifactId>postgresql</artifactId>
     <scope>runtime</scope>
   </dependency>
   ```
2. In `application.properties`, set:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/smartcampusdb
   spring.datasource.driver-class-name=org.postgresql.Driver
   spring.datasource.username=smartcampus
   spring.datasource.password=smartcampus
   spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
   spring.jpa.hibernate.ddl-auto=update
   ```
3. Remove H2 console properties (`spring.h2.console.*`).
4. Remove `spring.sql.init.mode=always` — conflicts with DDL auto-create; move seed data to `@Component` with `CommandLineRunner` if needed later.
5. Keep `app.upload-dir=uploads` and multipart size settings unchanged.

## Verification
```bash
docker compose up -d postgres
cd smartcampus && ./mvnw spring-boot:run
```
App starts without errors. Check logs for Hibernate DDL output creating tables. Connect via psql: `psql -h localhost -U smartcampus -d smartcampusdb -c '\dt'` — should list `bookings`, `resources`, `users`.

## When done
Mark `- [x] setup/setup-01` in `tasks/PROGRESS.md`.
