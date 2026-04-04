# Project Exploration Report: IT3030-PAF-2026-Smart-Campus-Group20

## Repository Overview

**Location:** `F:\PAF\IT3030-PAF-2026-Smart-Campus-Group20`

**Top-level structure:**
```
IT3030-PAF-2026-Smart-Campus-Group20/
├── .git/                 # Git repo (main branch, remote: origin)
├── .vite/                # Vite dependency cache (generated)
├── backend-api/          # Spring Boot backend
└── frontend-web/         # React + Vite frontend
```

**Notable absences at root level:**
- No `README.md`
- No `.github/workflows/` directory (CI/CD not configured)
- No `docker-compose.yml`, `Makefile`, or other orchestration files

---

## 1. Backend (`backend-api/`)

### Technology Stack

| Component | Detail |
|---|---|
| Framework | Spring Boot 3.2.4 |
| Java Version | 17 |
| Build Tool | Maven |
| ORM | Spring Data JPA (Hibernate) |
| Database | H2 (in-memory, development only) |
| Boilerplate Reduction | Lombok |
| Validation | `spring-boot-starter-validation` |
| Testing | `spring-boot-starter-test` (dependency declared, no tests written) |

### Application Configuration (`src/main/resources/application.properties`)

```properties
server.port=8080

# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:smartcampusdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# H2 Console Settings
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

### Package Structure: `com.smartcampus`

#### Application Entry Point

- **`SmartCampusOperationsHubApplication.java`** -- Standard `@SpringBootApplication` with `main()` method.

#### Entities (`models/entities/`) -- 6 files

| File | Table | Fields |
|---|---|---|
| `User.java` | `users` | `id`, `name`, `email` (unique), `role` (enum) |
| `Role.java` | (enum) | `USER`, `ADMIN`, `TECHNICIAN` |
| `Resource.java` | `resources` | `id`, `type`, `capacity`, `location`, `status` |
| `Booking.java` | `bookings` | `id`, `resourceId`, `userId`, `startTime`, `endTime`, `status` |
| `Ticket.java` | `tickets` | `id`, `resourceId`, `userId`, `description`, `priority`, `status` |
| `Notification.java` | `notifications` | `id`, `userId`, `message`, `isRead` |

All entities use Lombok `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`. All use `GenerationType.IDENTITY` for primary keys. No JPA relationships (`@OneToMany`, `@ManyToOne`, etc.) are defined between entities -- all foreign keys are plain `Long` fields.

#### Repositories (`repositories/`) -- 5 files

| File | Entity | Custom Queries |
|---|---|---|
| `UserRepository.java` | User | None |
| `ResourceRepository.java` | Resource | None |
| `BookingRepository.java` | Booking | None |
| `TicketRepository.java` | Ticket | None |
| `NotificationRepository.java` | Notification | None |

All repositories are bare `JpaRepository<Entity, Long>` interfaces with zero custom query methods. Missing: `findByUserId`, `findByStatus`, `findByStartTimeBetween`, `findByResourceId`, etc.

#### Services (`services/`) -- 5 files

| File | Methods |
|---|---|
| `UserService.java` | `getAllUsers`, `getUserById`, `createUser`, `updateUser` (stub), `deleteUser` |
| `ResourceService.java` | `getAllResources`, `getResourceById`, `createResource`, `updateResource` (stub), `deleteResource` |
| `BookingService.java` | `getAllBookings`, `getBookingById`, `createBooking`, `updateBooking` (stub), `deleteBooking` |
| `TicketService.java` | `getAllTickets`, `getTicketById`, `createTicket`, `updateTicket` (stub), `deleteTicket` |
| `NotificationService.java` | `getAllNotifications`, `getNotificationById`, `createNotification`, `updateNotification` (stub), `deleteNotification` |

All services use constructor injection. The `update` methods in every service are stubs -- they call `save(entity)` directly without first loading the existing entity or merging fields. Each contains a placeholder comment (`// Implementation logic` or `// Implementation details will be added here`).

#### Controllers (`controllers/`) -- 5 files

| File | Base Path | Endpoints |
|---|---|---|
| `UserController.java` | `/api/v1/users` | GET all, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `ResourceController.java` | `/api/v1/resources` | GET all, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `BookingController.java` | `/api/v1/bookings` | GET all, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `TicketController.java` | `/api/v1/tickets` | GET all, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |
| `NotificationController.java` | `/api/v1/notifications` | GET all, GET `/{id}`, POST, PUT `/{id}`, DELETE `/{id}` |

All controllers follow the same pattern: constructor injection, standard REST endpoints, `@Validated` on request bodies, throw `ResourceNotFoundException` on missing entities.

#### Exceptions (`exceptions/`) -- 3 files

| File | Purpose |
|---|---|
| `ResourceNotFoundException.java` | Custom `RuntimeException` |
| `GlobalExceptionHandler.java` | `@ControllerAdvice` handling `ResourceNotFoundException` (404) and generic `Exception` (500) |
| `ErrorResponse.java` | DTO with `timestamp`, `status`, `error`, `message` |

### Backend Build Status

Compiled `.class` files exist in `target/classes/`, confirming the project has been built successfully at least once.

### What is MISSING in Backend

- **No `src/test/` directory.** Zero unit tests, zero integration tests.
- **No security/authentication.** No Spring Security, no JWT, no OAuth2. The `pom.xml` has no security dependency.
- **No DTOs.** Entities are exposed directly in controllers -- no request/response DTOs, no mappers.
- **No custom repository queries.** No `findByUserId`, `findByStatus`, date-range queries, etc.
- **No data initialization.** No `data.sql`, `schema.sql`, or `@PostConstruct` seed data.
- **No pagination/sorting.** All `getAll` endpoints return full unbounded lists.
- **No production database configuration.** Only H2 in-memory is configured.
- **No API documentation.** No Swagger/OpenAPI/SpringDoc.
- **No JPA entity relationships.** All foreign keys are plain `Long` fields instead of `@ManyToOne`/`@OneToMany` mappings.
- **No transaction management annotations.** No `@Transactional` on service methods.
- **No logging configuration.** No `logback-spring.xml` or custom log levels.
- **No CORS configuration.** No `WebMvcConfigurer` or `@CrossOrigin` setup for frontend communication.
- **No DTO validation annotations.** Entities lack `@NotBlank`, `@Email`, `@Size`, etc. (only `@Validated` is used in controllers but entities have no JSR-380 constraints).

---

## 2. Frontend (`frontend-web/`)

### Technology Stack

| Component | Version |
|---|---|
| React | 19.2.4 |
| React DOM | 19.2.4 |
| Vite | 8.0.1 |
| React Router DOM | 7.13.2 |
| Tailwind CSS | 4.2.2 (with `@tailwindcss/vite` plugin) |
| Framer Motion | 12.38.0 |
| React Icons | 5.6.0 |
| Axios | 1.14.0 |
| ESLint | 9.39.4 |

### Vite Configuration (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

### Routing (`App.jsx`)

| Route | Component | Layout |
|---|---|---|
| `/login` | `LoginPage` | Standalone (no layout wrapper) |
| `/` | `DashboardPage` | `MainLayout` (Sidebar + Navbar) |
| `/facilities` | `FacilitiesPage` | `MainLayout` |
| `/bookings` | `BookingsPage` | `MainLayout` |
| `/tickets` | `TicketsPage` | `MainLayout` |

### Pages (5 files)

| File | State | Description |
|---|---|---|
| `LoginPage.jsx` | Static mock | Google sign-in button. On click, navigates to `/`. No actual authentication. |
| `DashboardPage.jsx` | Static mock | Two stat cards: "Active Bookings: 3", "Open Tickets: 1". Hardcoded values. Framer Motion hover effects. |
| `FacilitiesPage.jsx` | Static mock | Search bar + filter button + 4 hardcoded facility cards ("Main Hall A" etc.). No API calls. |
| `BookingsPage.jsx` | Static mock | Table with 3 hardcoded bookings (APPROVED, PENDING, REJECTED). "New Booking" button is non-functional. |
| `TicketsPage.jsx` | Static mock | Kanban board with 3 columns (Open: 2 tickets, In Progress: 1, Resolved: 0). All data hardcoded. |

### Layout & Shared Components

| File | Description |
|---|---|
| `MainLayout.jsx` | Flex layout with fixed Sidebar + Navbar + main content area. Uses Framer Motion `AnimatePresence` for page transition animations (fade + slide). |
| `Sidebar.jsx` | Fixed left sidebar (264px wide). 4 NavLink items: Dashboard, Facilities & Assets, My Bookings, Maintenance Tickets. Animated slide-in on mount. Active link highlighting. |
| `Navbar.jsx` | Top header bar with backdrop blur. Notification bell (green indicator dot) + hardcoded user profile "Alex Johnson / Student". |

### Styling (`index.css`)

```css
@import "tailwindcss";

@theme {
  --color-primary: var(--color-indigo-600);
  --color-secondary: var(--color-emerald-500);
}

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans antialiased;
  }
}
```

### ESLint Configuration

Standard Vite React setup with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. Rule: `no-unused-vars` with pattern to ignore uppercase variables (React components).

### What is MISSING in Frontend

- **No API integration.** `axios` is installed but **never imported or used** anywhere. All pages use hardcoded/mock data.
- **No state management.** No Context API, no Redux, no Zustand, no global stores.
- **No authentication flow.** Login page is a mock -- no OAuth, no token storage, no protected route guards.
- **No form handling.** No controlled forms, no validation, no submission logic.
- **No `src/services/` or `src/api/` directory.** No API client abstraction layer.
- **No `src/context/` or `src/store/` directory.** No global state.
- **No `src/hooks/` directory.** No custom React hooks.
- **No `src/utils/` or `src/helpers/` directory.** No utility functions.
- **No TypeScript.** Pure JavaScript (`.jsx` files).
- **`index.html` title is `"temp-app"`** -- not updated to project name.
- **`package.json` name is `"temp-app"`** -- not renamed.
- **No tests.** No Vitest, no React Testing Library, no test files.
- **No environment variables.** No `.env` file for API base URL configuration.
- **No error boundaries.** No React error boundary components.
- **No loading states.** No spinners, skeletons, or loading indicators for async operations.
- **No responsive/mobile testing.** No media query testing beyond Tailwind classes.

---

## 3. CI/CD (`.github/workflows/`)

**NOT CONFIGURED.** The `.github/` directory does not exist. No GitHub Actions workflows for:
- Backend build & test
- Frontend build & lint
- Deployment pipelines
- PR checks

---

## 4. README

- **No README at the repository root.**
- Only `frontend-web/README.md` exists -- this is the default Vite React template README, describing the template itself, not the Smart Campus project.

---

## 5. Git Status

- Branch: `main`
- Remote: `origin` (configured)
- Has packed objects (cloned or fetched from remote)
- No untracked files outside `.vite/` cache

---

## Overall Assessment

| Area | Status | Completeness |
|---|---|---|
| **Backend structure** | Fully scaffolded | All 5 domain modules (User, Resource, Booking, Ticket, Notification) have entity, repository, service, and controller. |
| **Backend business logic** | Skeleton/stub level | CRUD endpoints exist but services have placeholder `update` methods, no custom queries, no DTOs, no security, no tests. |
| **Backend database** | Dev-only | H2 in-memory only. No production DB config. No seed data. |
| **Frontend structure** | Fully scaffolded | Routing, layout, sidebar, navbar, and 5 pages all exist. |
| **Frontend logic** | Static/mock UI only | No API calls, no state management, no auth, no forms. `axios` unused. |
| **Frontend styling** | Polished | Tailwind CSS + Framer Motion animations. Clean, modern UI. |
| **CI/CD** | Not configured | No `.github/` directory. |
| **Documentation** | Missing | No project-level README. |
| **Testing** | Non-existent | No backend tests, no frontend tests. |
| **Build status** | Backend compiled | `.class` files in `target/`. Frontend `node_modules` status unknown. |

### Summary

The project is a **well-structured but early-stage scaffold**. The architecture is cleanly organized with proper separation of concerns on both sides. The frontend has polished, animated UI with Tailwind + Framer Motion. However, neither the backend nor frontend has real business logic, data connectivity, authentication, security, or tests implemented. It is ready for feature development but not yet functional as an application.
