# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Smart Campus Operations Hub — IT3030 PAF 2026 group assignment. Spring Boot 4.0.5 REST API + React 19 (Vite) frontend. Manages facility bookings and maintenance ticket workflows for a university.

## Commands

### Backend (`smartcampus/`)
```bash
# Run
./mvnw spring-boot:run

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=BookingServiceTest

# Run with test profile (H2 in-memory, no MySQL needed)
./mvnw test -Dspring.profiles.active=test

# Build JAR
./mvnw package -DskipTests
```

### Frontend (`frontend-web/`)
```bash
npm install        # first time
npm run dev        # dev server at http://localhost:5173
npm run build      # production build
npm run lint       # ESLint
npm run preview    # preview production build
```

## Architecture

### Backend — `smartcampus/src/main/java/com/campushub/smartcampus/`
Layered Spring Boot app:
- **`controller/`** — REST controllers, no business logic, delegate to services
- **`service/`** — all business logic lives here (conflict detection, workflow rules)
- **`repository/`** — Spring Data JPA interfaces only
- **`entity/`** — JPA entities mapped to MySQL tables
- **`dto/`** — request/response DTOs with static `fromEntity` factory methods; entities never leak out of the service layer
- **`enums/`** — BookingStatus, ResourceStatus, EquipmentType, etc.
- **`exception/`** — `GlobalExceptionHandler` handles `EntityNotFoundException` (404), `BookingConflictException` (409), `IllegalArgumentException` (400), `MethodArgumentNotValidException` (400)
- **`config/`** — `WebConfig` (CORS, static file serving)
- **`security/`** — JWT provider, auth filter, OAuth2 user service (added by auth tasks)

Key rule: `ResourceController` currently calls `ResourceRepository` directly (no service layer). `resource-02` task adds `ResourceService` — do not add more logic there before that task.

### Frontend — `frontend-web/src/`
- **`api/`** — axios instance (`axios.js`) + per-module API files (`bookingApi.js`, etc.)
- **`hooks/`** — custom hooks (`useBookings.js`, `useResources.js`) wrapping API calls with state
- **`pages/`** — one file per route/page
- **`components/`** — shared UI components
- **`layouts/`** — `MainLayout.jsx` (user) and `AdminLayout.jsx` (admin) with their respective navbars/sidebars
- **`context/`** — `ThemeContext.jsx` (existing); `AuthContext.jsx` added by auth-03 task

Stack: React 19, React Router v7, TanStack Query v5, Tailwind CSS v4, Framer Motion, Axios.

### Test pattern
Service tests use Mockito (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`) — no Spring context loaded. See `BookingServiceTest.java` as the reference pattern.

---

## Feature: Smart Campus Operations Hub (breakdown)

Task files are in `tasks/` organized by module: `auth/`, `resource/`, `booking/`, `ticket/`, `notification/`, `setup/`.
Run tasks within each module in order (see `tasks/PROGRESS.md`).
When a task is done, mark it complete: `- [x]` in `tasks/PROGRESS.md`.
Reference `tasks/CONTRACTS.md` for all shared interfaces — do not invent field names or endpoint paths.

**Key constraints:**
- **Do NOT add `@PreAuthorize` to any controller** unless you are working on `auth/auth-04`. All modules build without auth first; auth-04 wires it all at once after auth branch merges.
- All module tasks (resource, booking, ticket, notification) accept `userId` as part of the request body/param until auth-04 lands. See existing `BookingRequestDTO.userId` as the pattern.
- Spring Boot 4.0.5 + Java 26. Use lambda DSL for all Spring Security config (no `WebSecurityConfigurerAdapter`).
- DB is MySQL (setup-01 migrates from H2). Use `spring.jpa.hibernate.ddl-auto=update`. Do not use `create-drop`.
- `ResourceController` currently bypasses service layer (talks to repo directly). `resource-02` fixes this — do not add logic to the controller before then.
- Notifications must be triggered inside service methods (BookingService, TicketService) by injecting NotificationService. Not in controllers.
- File uploads stored under `uploads/` dir at project root, served via `/uploads/**` static mapping. Max 3 files per ticket enforced in TicketService.
- JWT: `Authorization: Bearer <token>`. OAuth2 success redirects to `http://localhost:5173/auth/callback?token=<jwt>`.
- WebSocket auth: JWT as query param `/ws?token=<jwt>`.
- Recurring bookings: check ALL dates in series for conflicts before saving any (all-or-nothing).
- Equipment is fixed to one room (`room_id` FK on equipment table).
- Member allocation: Lakshika = booking module (booking-01 through booking-04).



## Rules for All Contributors (Human and AI)

### 1. One Commit Per Sub-Task

Every sub-task must be committed individually when completed. Do NOT bundle multiple sub-tasks into a single commit.

**Good:**
```
feat(resource): add findByType and findByLocation queries
feat(resource): add pagination support to repository
```

**Bad:**
```
feat(resource): add all repository queries and pagination
```

### 2. Commit Message Format

Use Conventional Commits:

```
<type>(<scope>): <short description>
```

**Types:**
- `feat` -- new feature or functionality
- `fix` -- bug fix
- `docs` -- documentation changes
- `chore` -- build, config, tooling changes
- `refactor` -- code restructuring without behavior change
- `test` -- adding or modifying tests
- `style` -- formatting, linting, no logic changes

**Scopes:** Use the domain or file being changed. Examples: `resource`, `booking`, `ticket`, `notification`, `auth`, `frontend`, `ci`, `config`.


### 3. Before Committing

- [ ] Run backend: `mvn clean compile` (must succeed)
- [ ] Run frontend: `npm run lint` (must pass)
- [ ] Run frontend: `npm run build` (must succeed)
- [ ] Verify no console errors in browser dev tools
- [ ] Verify dark mode and light mode both render correctly (for frontend changes)

