# Task auth-01 — JWT Provider + Security Filter

## Goal
Add Spring Security + JWT dependencies and create the token provider and auth filter that all other tasks depend on.

## Prerequisite
setup-01

## Context
- `smartcampus/pom.xml` — no security deps yet
- `entity/User.java` — has `email` and `role` (String) fields
- New package: `com.campushub.smartcampus.security`

## What to build
- `smartcampus/pom.xml` (modify)
- `smartcampus/src/main/resources/application.properties` (modify)
- `enums/UserRole.java` (new)
- `security/JwtTokenProvider.java` (new)
- `security/JwtAuthFilter.java` (new, extends `OncePerRequestFilter`)

## Steps
1. Add to `pom.xml`:
   ```xml
   <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-oauth2-client</artifactId>
   </dependency>
   <dependency>
     <groupId>io.jsonwebtoken</groupId>
     <artifactId>jjwt-api</artifactId>
     <version>0.12.6</version>
   </dependency>
   <dependency>
     <groupId>io.jsonwebtoken</groupId>
     <artifactId>jjwt-impl</artifactId>
     <version>0.12.6</version>
     <scope>runtime</scope>
   </dependency>
   <dependency>
     <groupId>io.jsonwebtoken</groupId>
     <artifactId>jjwt-jackson</artifactId>
     <version>0.12.6</version>
     <scope>runtime</scope>
   </dependency>
   ```
2. Add to `application.properties`:
   ```properties
   app.jwt.secret=<run: openssl rand -base64 32>
   app.jwt.expiration=86400000
   app.frontend-url=http://localhost:5173
   ```
3. Create `UserRole` enum: `USER`, `ADMIN`, `TECHNICIAN`.
4. `JwtTokenProvider` (`@Component`):
   - `generateToken(User user)` — HS256 JWT; claims: `sub`=email, `userId`=id (Long), `role`=role string; expiry from `${app.jwt.expiration}`
   - `validateToken(String token)` → boolean (catch `JwtException`)
   - `getEmailFromToken(String token)` → String
   - `getUserIdFromToken(String token)` → Long
   - `getRoleFromToken(String token)` → String
5. `JwtAuthFilter` (`OncePerRequestFilter`):
   - Extract `Authorization: Bearer <token>` header
   - If valid: load `User` from `UserRepository` by email; build `UsernamePasswordAuthenticationToken` with authority `ROLE_<role>`; set in `SecurityContextHolder`
   - If invalid/missing: continue filter chain without authentication

## Verification
Unit test `JwtTokenProvider` with a mock User — generate, validate, extract email + userId. Run:
```bash
cd smartcampus && ./mvnw test -Dtest=JwtTokenProviderTest -Dspring.profiles.active=test
```

## When done
Mark `- [x] auth/auth-01` in `tasks/PROGRESS.md`.
