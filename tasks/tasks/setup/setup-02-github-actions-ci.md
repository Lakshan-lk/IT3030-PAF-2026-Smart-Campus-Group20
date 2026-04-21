# Task setup-02 — GitHub Actions CI

## Goal
Add a CI workflow that builds the Spring Boot API and React frontend on every push and PR to `main`.

## Prerequisite
setup-01 (tests need a DB — use H2 in CI scope so no MySQL service needed in Actions).

## Context
- Repo root: `IT3030-PAF-2026-Smart-Campus-Group20/`
- Backend: `smartcampus/` (Maven wrapper `./mvnw`)
- Frontend: `frontend-web/` (npm + Vite)
- No existing `.github/workflows/` directory

## What to build
- `.github/workflows/ci.yml` (new)
- `smartcampus/src/test/resources/application-test.properties` (new) — H2 override for tests

## Steps
1. Create `smartcampus/src/test/resources/application-test.properties`:
   ```properties
   spring.datasource.url=jdbc:h2:mem:testdb
   spring.datasource.driver-class-name=org.h2.Driver
   spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
   spring.jpa.hibernate.ddl-auto=create-drop
   spring.sql.init.mode=never
   ```
   Add H2 back as `<scope>test</scope>` in `pom.xml` (keep MySQL as runtime dep):
   ```xml
   <dependency>
     <groupId>com.h2database</groupId>
     <artifactId>h2</artifactId>
     <scope>test</scope>
   </dependency>
   ```
2. Create `.github/workflows/ci.yml`. Trigger on push + PR to `main`. Two jobs: `backend` and `frontend`.
   - `backend`: checkout → Java 21 setup (use `actions/setup-java@v4` with `temurin`) → `cd smartcampus && ./mvnw test -Dspring.profiles.active=test`
   - `frontend`: checkout → Node 20 setup → `cd frontend-web && npm ci && npm run build`
3. Use `actions/checkout@v4`, `actions/setup-java@v4`, `actions/setup-node@v4`.
4. Note: pom.xml declares `<java.version>26</java.version>` — if Actions toolchain doesn't have Java 26, temporarily target Java 21 in CI via `mvnw -Djava.version=21` or change pom `java.version` to 21.

## Verification
Push to a branch and open a PR to `main`. Both jobs pass green in the Actions tab.

## When done
Mark `- [x] setup/setup-02` in `tasks/PROGRESS.md`.
