# Smart Campus Operations Hub -- Task Breakdown

> **Last updated:** 2026-04-04
> **Team:** 4 members
> **Branching strategy:** Feature branch per task (e.g., `feat/resource-dtos`, `feat/booking-conflict`)
> **Commit rule:** Every completed sub-task must have its own git commit. See AGENTS.md.

---

## Team Decisions & Architecture Constraints

These decisions apply to ALL members. Read before starting any task.

| Decision | Detail |
|---|---|
| **Service transactions** | All service classes must have `@Transactional` at class level. Use `@Transactional(readOnly = true)` on read-only methods (`getAll`, `getById`). |
| **DTOs** | All controllers must use DTOs for request/response. No JPA entities exposed directly. Use manual mappers (static `fromEntity()` / `toEntity()` methods). No MapStruct. |
| **Authentication** | OAuth2 session-based only (Google). No JWT. Spring Security manages session cookies. |
| **File storage** | Local filesystem (`uploads/tickets/`). Store file path in DB. |
| **Real-time notifications** | STOMP over WebSocket (`spring-boot-starter-websocket`). Frontend uses `@stomp/stompjs`. |
| **Database migrations** | Dev keeps `ddl-auto=update`. Each new migration is its own `Vx__description.sql` file. Seed data via `data.sql`. |
| **Frontend HTTP** | Axios + React Query (`@tanstack/react-query`). Axios for calls, React Query for caching/loading/refetch. |
| **Frontend structure** | Reorganized `src/`: `api/`, `context/`, `hooks/`, `utils/`, `components/`, `pages/`, `layouts/`, `assets/`. |
| **Theme** | Dark mode AND light mode. Toggle available in Navbar. Use CSS variables or Tailwind `dark:` classes. |
| **Frontend design** | Modern, refined UI. "Luminous Depth" aesthetic: glass-like panels, warm neutrals, striking accent color, layered shadows, choreographed staggered animations. Use frontend-design skill for all new/updated UI. |
| **Git workflow** | Feature branch per task. One commit per completed sub-task. See AGENTS.md. |

---

## Member 1: Facilities Catalogue + Resource Management

- [ ] **Backend: Enhance Resource entity**
  - [ ] Add fields: `name`, `description`, `imageUrl`, `amenities` (JSON or separate table)
  - [ ] Add `@NotBlank`, `@Size` validation annotations
  - [ ] Add `@CreatedDate`, `@LastModifiedDate` auditing fields
  - [ ] Add `@EntityListeners(AuditingEntityListener.class)` and enable auditing in config
- [ ] **Backend: Custom repository queries for Resource**
  - [ ] `findByType(String type)`
  - [ ] `findByLocation(String location)`
  - [ ] `findByStatus(String status)`
  - [ ] `findByNameContainingIgnoreCase(String keyword)`
  - [ ] `findAll(Pageable pageable)` support
- [ ] **Backend: Resource DTOs** (manual mapper, no MapStruct)
  - [ ] Create `ResourceRequestDTO` (for POST/PUT)
  - [ ] Create `ResourceResponseDTO` (for GET responses)
  - [ ] Add static mapper methods: `toEntity()`, `fromEntity()`
- [ ] **Backend: ResourceController improvements**
  - [ ] Add pagination & sorting to `GET /api/v1/resources`
  - [ ] Add query param filtering: `?type=`, `?location=`, `?status=`, `?search=`
  - [ ] Replace entity with DTOs in request/response
- [ ] **Backend: ResourceService update logic**
  - [ ] Add `@Transactional` at class level, `@Transactional(readOnly = true)` on reads
  - [ ] Replace stub `updateResource` with proper load-merge-save pattern
  - [ ] Add business validation (e.g., capacity > 0)
- [ ] **Backend: Resource seed data**
  - [ ] Add 8-10 sample resources to `data.sql` (lecture halls, labs, meeting rooms, equipment)
- [ ] **Frontend: Connect FacilitiesPage to API**
  - [ ] Add `@tanstack/react-query` to `package.json`
  - [ ] Create `api/resourceApi.js` with axios calls
  - [ ] Create `hooks/useResources.js` with React Query hooks
  - [ ] Fetch resources from `GET /api/v1/resources`
  - [ ] Replace hardcoded cards with dynamic data
  - [ ] Add loading skeleton/spinner
  - [ ] Add error state handling
  - [ ] Support dark mode on all cards and states
- [ ] **Frontend: Search & filter on FacilitiesPage**
  - [ ] Wire search bar to `?search=` query param
  - [ ] Wire filter button to type/location/status filters
  - [ ] Use React Query `refetch` or `invalidateQueries` on filter change
- [ ] **Frontend: Resource detail view**
  - [ ] Add modal or detail page showing full resource info
  - [ ] Show availability status
  - [ ] Link to booking flow
  - [ ] Design with frontend-design skill (modern, refined, dark+light mode)

---

## Member 2: Booking Workflow + Conflict Checking

- [x] **Backend: Enhance Booking entity**
  - [x] Add `purpose` / `description` field
  - [x] Add `@CreatedDate` auditing field
  - [x] Add JPA `@ManyToOne` relationship to `Resource` (with `@JoinColumn`)
  - [x] Add JPA `@ManyToOne` relationship to `User` (with `@JoinColumn`)
- [x] **Backend: Booking conflict checking**
  - [x] Implement overlap detection: prevent double-booking same resource in overlapping time windows
  - [x] Create custom query: `findByResourceIdAndStartTimeBeforeAndEndTimeAfter`
  - [x] Create `BookingConflictException` with descriptive message
  - [x] Add handler in `GlobalExceptionHandler`
- [x] **Backend: Booking status workflow**
  - [x] Create `BookingStatus` enum: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
  - [x] Replace String `status` with enum
  - [x] Implement approval/rejection logic (admin-only)
  - [x] Add `cancelBooking` endpoint with validation (can't cancel past or approved bookings)
- [x] **Backend: Custom repository queries for Booking**
  - [x] `findByUserId(Long userId)`
  - [x] `findByResourceId(Long resourceId)`
  - [x] `findByStatus(BookingStatus status)`
  - [x] `findByUserIdAndStatus(Long userId, BookingStatus status)`
  - [x] `findByResourceIdAndStartTimeBetween(Long resourceId, LocalDateTime start, LocalDateTime end)`
- [x] **Backend: Booking DTOs** (manual mapper, no MapStruct)
  - [x] Create `BookingRequestDTO` (with validation: endTime > startTime)
  - [x] Create `BookingResponseDTO` (includes resource name, user name, formatted dates)
  - [x] Add static mapper methods
- [x] **Backend: BookingController improvements**
  - [x] Add `POST /api/v1/bookings/{id}/cancel` endpoint
  - [x] Add `PUT /api/v1/bookings/{id}/approve` (admin)
  - [x] Add `PUT /api/v1/bookings/{id}/reject` (admin)
  - [x] Add pagination to `GET /api/v1/bookings`
- [x] **Backend: BookingService update logic**
  - [x] Add `@Transactional` at class level, `@Transactional(readOnly = true)` on reads
  - [x] Replace stub `updateBooking` with proper load-merge-save
  - [x] Add conflict check on create and update
- [x] **Backend: Booking seed data**
  - [x] Add 5-6 sample bookings to `data.sql` (mix of statuses, valid foreign keys)
- [ ] **Frontend: Connect BookingsPage to API**
  - [ ] Create `api/bookingApi.js` with axios calls
  - [ ] Create `hooks/useBookings.js` with React Query hooks
  - [ ] Fetch bookings from `GET /api/v1/bookings`
  - [ ] Replace hardcoded table rows with dynamic data
  - [ ] Add loading and error states
  - [ ] Support dark mode on table, badges, and all states
- [ ] **Frontend: New Booking form**
  - [ ] Implement modal/page with resource selector, date picker, time picker, purpose field
  - [ ] Add form validation (required fields, endTime after startTime)
  - [ ] Handle booking conflict error from backend (show user-friendly message)
  - [ ] Submit to `POST /api/v1/bookings`
  - [ ] Invalidate bookings query on success (React Query)
  - [ ] Design with frontend-design skill
- [ ] **Frontend: Booking actions**
  - [ ] Add cancel button for user's own pending bookings
  - [ ] Add approve/reject buttons for admin role
  - [ ] Refresh list after action (React Query `invalidateQueries`)
- [ ] **Frontend: Dashboard stats integration**
  - [ ] Replace hardcoded "Active Bookings: 3" with real count from API
  - [ ] Support dark mode on stat cards

---

## Member 3: Incident Tickets + Attachments + Technician Updates

- [ ] **Backend: Enhance Ticket entity**
  - [ ] Add `title` field
  - [ ] Add `createdAt`, `updatedAt` auditing fields
  - [ ] Add `assignedTo` (Long, nullable -- technician user id)
  - [ ] Create `TicketStatus` enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
  - [ ] Create `TicketPriority` enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - [ ] Replace String `status` and `priority` with enums
  - [ ] Add JPA `@ManyToOne` to `User` (reporter)
  - [ ] Add JPA `@ManyToOne` to `User` (assignee, nullable)
- [ ] **Backend: Attachment entity**
  - [ ] Create `Attachment.java`: `id`, `ticketId`, `fileName`, `fileType`, `fileSize`, `fileUrl`, `uploadedAt`
  - [ ] Create `AttachmentRepository`
  - [ ] Create `AttachmentService` with local filesystem storage logic
  - [ ] Create `AttachmentController` with upload/download/delete endpoints
- [ ] **Backend: File upload handling**
  - [ ] Add `spring.servlet.multipart.max-file-size=10MB` to `application.properties`
  - [ ] Add `spring.servlet.multipart.max-request-size=10MB`
  - [ ] Implement `POST /api/v1/tickets/{id}/attachments` (multipart upload, local storage)
  - [ ] Implement `GET /api/v1/attachments/{id}/download`
  - [ ] Implement `DELETE /api/v1/attachments/{id}`
- [ ] **Backend: Custom repository queries for Ticket**
  - [ ] `findByStatus(TicketStatus status)`
  - [ ] `findByPriority(TicketPriority priority)`
  - [ ] `findByUserId(Long userId)` (reporter)
  - [ ] `findByAssignedTo(Long assignedTo)` (technician)
  - [ ] `findByStatusAndPriority(TicketStatus status, TicketPriority priority)`
  - [ ] `findByResourceId(Long resourceId)`
- [ ] **Backend: Ticket DTOs** (manual mapper, no MapStruct)
  - [ ] Create `TicketRequestDTO`
  - [ ] Create `TicketResponseDTO` (includes reporter name, assignee name, attachment count)
  - [ ] Add static mapper methods
- [ ] **Backend: Technician workflow**
  - [ ] Add `PUT /api/v1/tickets/{id}/assign` (admin assigns technician)
  - [ ] Add `PUT /api/v1/tickets/{id}/status` (technician updates status)
  - [ ] Add `POST /api/v1/tickets/{id}/comments` (add note/update to ticket)
  - [ ] Create `TicketComment` entity: `id`, `ticketId`, `authorId`, `content`, `createdAt`
  - [ ] Create `TicketCommentRepository`, `TicketCommentService`, endpoints
- [ ] **Backend: TicketController improvements**
  - [ ] Add pagination & sorting
  - [ ] Add query param filtering: `?status=`, `?priority=`, `?assignedTo=`
- [ ] **Backend: TicketService update logic**
  - [ ] Add `@Transactional` at class level, `@Transactional(readOnly = true)` on reads
  - [ ] Replace stub with proper load-merge-save
  - [ ] Add audit trail (log status changes)
- [ ] **Backend: Ticket seed data**
  - [ ] Add 6-8 sample tickets to `data.sql` (various statuses/priorities, valid FKs)
- [ ] **Frontend: Connect TicketsPage to API**
  - [ ] Create `api/ticketApi.js` with axios calls
  - [ ] Create `hooks/useTickets.js` with React Query hooks
  - [ ] Fetch tickets from `GET /api/v1/tickets`
  - [ ] Replace hardcoded kanban cards with real data
  - [ ] Group by status columns dynamically
  - [ ] Add loading and error states
  - [ ] Support dark mode on kanban columns, cards, and badges
- [ ] **Frontend: Create Ticket form**
  - [ ] Implement modal with title, description, resource selector, priority selector
  - [ ] Add file upload for attachments
  - [ ] Submit to `POST /api/v1/tickets`
  - [ ] Invalidate tickets query on success
  - [ ] Design with frontend-design skill
- [ ] **Frontend: Ticket detail view**
  - [ ] Add modal/page showing full ticket info
  - [ ] Show attachment list with download links
  - [ ] Show comments/history section
  - [ ] Support dark mode
- [ ] **Frontend: Technician workflow UI**
  - [ ] Allow drag-and-drop or dropdown to change ticket status in kanban
  - [ ] Add assign technician dropdown (admin only)
  - [ ] Add comment/note input field
- [ ] **Frontend: Dashboard stats integration**
  - [ ] Replace hardcoded "Open Tickets: 1" with real count from API
  - [ ] Support dark mode on stat cards

---

## Member 4: Notifications + Role Management + OAuth Integration

- [ ] **Backend: Spring Security setup**
  - [ ] Add `spring-boot-starter-security` and `spring-boot-starter-oauth2-client` to `pom.xml`
  - [ ] Add `spring-boot-starter-websocket` to `pom.xml`
  - [ ] Create `SecurityConfig` class
  - [ ] Configure HTTP security (permit public endpoints, protect others)
  - [ ] Configure CORS to allow frontend origin
  - [ ] Enable method security: `@EnableMethodSecurity`
- [ ] **Backend: OAuth2 / Google login**
  - [ ] Register OAuth2 client in `application.properties` (Google client-id, client-secret)
  - [ ] Implement `OAuth2UserService` to map Google user to `User` entity
  - [ ] Auto-create user on first login if not exists
  - [ ] Configure success/failure redirect URLs
  - [ ] Add `/api/v1/auth/me` endpoint to return current authenticated user
  - [ ] Add `/api/v1/auth/logout` endpoint
- [ ] **Backend: Role-based access control**
  - [ ] Secure endpoints with `@PreAuthorize` annotations
  - [ ] `ADMIN`: full access to all resources, bookings, tickets, users
  - [ ] `TECHNICIAN`: read/write tickets assigned to them, read resources
  - [ ] `USER`: read own bookings/tickets, create bookings/tickets, read resources
- [ ] **Backend: WebSocket configuration**
  - [ ] Create `WebSocketConfig` implementing `WebSocketMessageBrokerConfigurer`
  - [ ] Enable STOMP: `@EnableWebSocketMessageBroker`
  - [ ] Configure endpoint: `/ws` for connection
  - [ ] Configure topic prefix: `/topic`
  - [ ] Set up user-specific destinations: `/user`
  - [ ] Integrate with Spring Security (authenticate WebSocket connections)
- [ ] **Backend: Enhance Notification entity**
  - [ ] Add `type` enum: `BOOKING_CREATED`, `BOOKING_APPROVED`, `BOOKING_REJECTED`, `TICKET_ASSIGNED`, `TICKET_UPDATED`, `GENERAL`
  - [ ] Add `createdAt` auditing field
  - [ ] Add `readAt` (nullable LocalDateTime)
  - [ ] Add JPA `@ManyToOne` to `User`
- [ ] **Backend: Custom repository queries for Notification**
  - [ ] `findByUserIdOrderByCreatedAtDesc(Long userId)`
  - [ ] `findByUserIdAndIsReadFalse(Long userId)`
  - [ ] `countByUserIdAndIsReadFalse(Long userId)`
  - [ ] Add pagination support
- [ ] **Backend: Notification DTOs** (manual mapper)
  - [ ] Create `NotificationResponseDTO`
  - [ ] Add static mapper methods
- [ ] **Backend: Notification triggers**
  - [ ] Create notification on booking created → send via WebSocket to user
  - [ ] Create notification on booking approved/rejected → send via WebSocket
  - [ ] Create notification on ticket assigned → send via WebSocket to technician
  - [ ] Create notification on ticket status changed → send via WebSocket
  - [ ] Use `SimpMessagingTemplate.convertAndSendToUser()` for real-time delivery
- [ ] **Backend: NotificationController improvements**
  - [ ] Add `PUT /api/v1/notifications/{id}/read` (mark single as read)
  - [ ] Add `PUT /api/v1/notifications/read-all` (mark all as read for current user)
  - [ ] Filter notifications by current authenticated user (SecurityContext)
- [ ] **Backend: Enhance User entity for auth**
  - [ ] Add `provider` field (e.g., "GOOGLE", "LOCAL")
  - [ ] Add `providerId` field (OAuth2 sub/id)
  - [ ] Add `profileImageUrl` field
  - [ ] Add `createdAt` auditing field
- [ ] **Backend: User seed data**
  - [ ] Add admin, technician, and regular user accounts to `data.sql`
- [ ] **Frontend: Auth integration**
  - [ ] Implement Google OAuth sign-in (redirect to backend `/oauth2/authorization/google`)
  - [ ] Create `context/AuthContext.jsx` for global auth state
  - [ ] Fetch current user from `/api/v1/auth/me` on app load
  - [ ] Store auth state in React context
- [ ] **Frontend: Protected routes**
  - [ ] Create `components/ProtectedRoute.jsx` wrapper
  - [ ] Redirect unauthenticated users to `/login`
  - [ ] Show role-based access denied page
- [ ] **Frontend: Axios interceptors**
  - [ ] Create `api/axios.js` instance with base URL from env var
  - [ ] Add response interceptor for 401 (redirect to login) and 403 (show access denied)
- [ ] **Frontend: Connect Navbar to auth**
  - [ ] Replace hardcoded "Alex Johnson" with authenticated user info from context
  - [ ] Add logout button (calls `/api/v1/auth/logout`)
  - [ ] Show user role badge
  - [ ] Add dark/light mode toggle button
- [ ] **Frontend: WebSocket integration**
  - [ ] Add `@stomp/stompjs` and `sockjs-client` to `package.json`
  - [ ] Create `hooks/useWebSocket.js` custom hook
  - [ ] Connect to `/ws` endpoint on auth
  - [ ] Subscribe to `/user/topic/notifications`
  - [ ] Update notification count in real-time on message received
  - [ ] Handle disconnect/reconnect
- [ ] **Frontend: Notification bell integration**
  - [ ] Fetch unread count from `GET /api/v1/notifications?unread=true`
  - [ ] Add dropdown showing recent notifications
  - [ ] Mark as read on click
  - [ ] "Mark all as read" button
  - [ ] Real-time badge update via WebSocket
- [ ] **Frontend: Role-based UI**
  - [ ] Conditionally show/hide admin actions (approve/reject bookings, assign tickets)
  - [ ] Conditionally show technician actions (update ticket status)
  - [ ] Hide admin-only routes from non-admin users in sidebar
- [ ] **Frontend: Dark/Light mode**
  - [ ] Create `context/ThemeContext.jsx` with toggle
  - [ ] Persist preference in `localStorage`
  - [ ] Apply `dark:` Tailwind classes across ALL pages and components
  - [ ] Design with frontend-design skill (modern, refined, both modes)

---

## General Tasks (Not Assigned to Specific Members)

### CI/CD Pipeline

- [ ] **Backend GitHub Actions workflow** (`.github/workflows/backend-ci.yml`)
  - [ ] Trigger on PR and push to `main`
  - [ ] Set up JDK 17
  - [ ] Cache Maven dependencies
  - [ ] Run `mvn clean compile`
  - [ ] Run `mvn test`
  - [ ] Run `mvn verify` (integration tests when added)
  - [ ] Upload build artifacts
- [ ] **Frontend GitHub Actions workflow** (`.github/workflows/frontend-ci.yml`)
  - [ ] Trigger on PR and push to `main`
  - [ ] Set up Node.js (v20+)
  - [ ] Cache `node_modules`
  - [ ] Run `npm ci`
  - [ ] Run `npm run lint`
  - [ ] Run `npm run build`
  - [ ] Upload build artifacts
- [ ] **Deploy workflow** (`.github/workflows/deploy.yml`) *(optional, when ready)*
  - [ ] Trigger on push to `main` after CI passes
  - [ ] Deploy backend to cloud platform (Render, Railway, AWS, etc.)
  - [ ] Deploy frontend to Vercel, Netlify, or Cloudflare Pages
  - [ ] Set environment variables/secrets in GitHub repo settings

### Project Documentation

- [ ] **Root `README.md`**
  - [ ] Project title and description
  - [ ] Team members and roles
  - [ ] Tech stack overview
  - [ ] Prerequisites (Java 17, Node.js, Maven)
  - [ ] Setup instructions (backend + frontend)
  - [ ] How to run (dev mode)
  - [ ] API endpoint overview
  - [ ] Project structure diagram
- [ ] **API Documentation**
  - [ ] Add `springdoc-openapi-starter-webmvc-ui` to backend `pom.xml`
  - [ ] Add `@Operation`, `@ApiResponse` annotations to controllers
  - [ ] Verify Swagger UI at `/swagger-ui.html`
- [ ] **Contributing guidelines** (`CONTRIBUTING.md`)
  - [ ] Git branching strategy (feature branch per task)
  - [ ] Commit message conventions (one commit per sub-task)
  - [ ] PR review process
  - [ ] Code style guidelines

### Database & Configuration

- [ ] **Production database profile**
  - [ ] Add PostgreSQL or MySQL dependency to `pom.xml`
  - [ ] Create `application-prod.properties` profile
  - [ ] Configure production datasource URL, credentials
  - [ ] Keep H2 for `dev` profile
- [ ] **Database migrations**
  - [ ] Add Flyway dependency to `pom.xml`
  - [ ] Create `V1__initial_schema.sql` from current entities
  - [ ] Each new schema change gets its own `Vx__description.sql` file
  - [ ] Dev profile keeps `ddl-auto=update` for easy local development
  - [ ] Prod profile sets `ddl-auto=validate`
- [ ] **Frontend environment variables**
  - [ ] Create `.env.example` with `VITE_API_BASE_URL=http://localhost:8080`
  - [ ] Create `.env` (gitignored) with actual values
  - [ ] Update axios base URL to use `import.meta.env.VITE_API_BASE_URL`
- [x] **Backend CORS configuration**
  - [x] Create `WebConfig` class implementing `WebMvcConfigurer`
  - [x] Configure `addCorsMappings` to allow frontend origin (including credentials for session auth)
  - [x] Allow credentials: `allowedOrigins` + `allowCredentials(true)`

### Project Cleanup

- [ ] Rename `package.json` `"name"` from `"temp-app"` to `"smart-campus-frontend"`
- [ ] Update `index.html` `<title>` from `"temp-app"` to `"Smart Campus Operations Hub"`
- [ ] Add `target/` to backend `.gitignore` (if not already)
- [ ] Remove `.vite/` from repo (add to `.gitignore`)
- [ ] Add `.env` to frontend `.gitignore`
- [ ] Add `.idea/`, `.vscode/` (except extensions.json) to `.gitignore`
- [ ] Add `uploads/` to backend `.gitignore` (local file storage)

### Testing (When Ready)

- [ ] **Backend tests**
  - [ ] Unit tests for services (Mockito)
  - [ ] Integration tests for controllers (`@WebMvcTest`)
  - [ ] Repository tests (`@DataJpaTest`)
- [ ] **Frontend tests**
  - [ ] Add Vitest + React Testing Library
  - [ ] Component unit tests
  - [ ] Integration tests for pages

---

## Dependencies & Blockers

| Task | Depends On |
|---|---|
| All frontend API integration | Backend endpoints must be functional first |
| Auth-protected frontend routes | Member 4 completes backend auth setup |
| Booking conflict checking | Member 1 completes Resource endpoints |
| Notification triggers (WebSocket) | Members 2 & 3 complete booking/ticket workflows |
| CI/CD workflows | None (can start immediately) |
| API documentation | Backend endpoints must be stable |
| Production DB config | All entity changes finalized |
| Testing | Core functionality implemented |
| Frontend dark mode on all pages | All pages must be built first |

---

## Recommended Execution Order

1. **Week 1:** General tasks (CI/CD, README, CORS, env vars, project cleanup, Flyway setup) + all members start backend entity/repository enhancements
2. **Week 2:** Backend service/controller improvements + DTOs + seed data + Member 4 starts auth + WebSocket setup
3. **Week 3:** Frontend API integration begins (Member 3 leads) + Member 4 completes auth + others finish backend
4. **Week 4:** Frontend form implementations, role-based UI, notification integration, dark/light mode across all pages, WebSocket real-time updates
5. **Week 5:** Testing, documentation, bug fixes, deployment prep

---

## Git Commit Convention

Every sub-task completion must be committed individually. Format:

```
<type>(<scope>): <description>

feat(resource): add custom repository queries
fix(booking): resolve conflict detection edge case
docs(readme): add setup instructions
chore(ci): add backend workflow
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`

See AGENTS.md for full rules.
