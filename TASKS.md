# Smart Campus Operations Hub -- Task Breakdown

> **Last updated:** 2026-04-17
> **Team:** 4 members
> **Branching strategy:** Feature branch per task (e.g., `feat/resource-dtos`, `feat/booking-conflict`)
> **Commit rule:** Every completed sub-task must have its own git commit. See AGENTS.md.
> **Reference:** This file is synchronized with IMPLEMENTATION_PLAN.md - additional phases from the implementation plan are incorporated below.

---

## Team Decisions & Architecture Constraints

These decisions apply to ALL members. Read before starting any task.

| Decision | Detail |
|---|---|
| **Service transactions** | All service classes must have `@Transactional` at class level. Use `@Transactional(readOnly = true)` on read-only methods (`getAll`, `getById`). |
| **DTOs** | All controllers must use DTOs for request/response. No JPA entities exposed directly. Use manual mappers (static `fromEntity()` / `toEntity()` methods). No MapStruct. |
| **Authentication** | OAuth2 session-based only (Google + Microsoft). No JWT. Spring Security manages session cookies. |
| **File storage** | Local filesystem (`uploads/tickets/`). Store file path in DB. |
| **Real-time notifications** | STOMP over WebSocket (`spring-boot-starter-websocket`). Frontend uses `@stomp/stompjs`. |
| **Database migrations** | Dev keeps `ddl-auto=update`. Each new migration is its own `Vx__description.sql` file. Seed data via `data.sql`. |
| **Frontend HTTP** | Axios + React Query (`@tanstack/react-query`). Axios for calls, React Query for caching/loading/refetch. |
| **Frontend structure** | Reorganized `src/`: `api/`, `context/`, `hooks/`, `utils/`, `components/`, `pages/`, `layouts/`, `assets/`. |
| **Theme** | Dark mode AND light mode. Toggle available in Navbar. Use CSS variables or Tailwind `dark:` classes. |
| **Frontend design** | Vibrant SaaS aesthetic (Linear + LangChain + Google Material You): large rounded corners (`rounded-2xl`, `rounded-3xl`), subtle layered shadows, rich colors, smooth animations. Use frontend-design skill for all new/updated UI. |
| **Git workflow** | Feature branch per task. One commit per completed sub-task. See AGENTS.md. |

### Design System Guidelines

**Visual Aesthetic:**
- **Style**: Modern SaaS dashboard (Linear + LangChain + Google Material You)
- **Corners**: Large rounded corners (`rounded-2xl`, `rounded-3xl` for cards)
- **Shadows**: Subtle, layered shadows (`shadow-lg`, `shadow-xl` with low opacity)
- **Spacing**: Compact but breathable (not excessive whitespace)
- **Typography**: Inter font, clean hierarchy

**Color Palette:**
- **Primary**: Indigo/Violet gradient (`from-indigo-500 to-violet-600`)
- **Background**: Slate 50/900 (light/dark modes)
- **Surface**: White with subtle borders (`border-slate-200`)
- **Accents**: Success (Emerald 500), Warning (Amber 500), Error (Rose 500), Info (Blue 500)

**Material Design Components:**
- **Elevation**: Use shadow levels (0dp, 1dp, 2dp, 4dp, 8dp, 16dp)
- **Ripple Effect**: Add to buttons and interactive elements
- **FAB**: Floating Action Button (`rounded-full shadow-lg`)
- **Chips**: For filters and tags (`rounded-full bg-slate-100`)
- **Bottom Sheets**: For mobile detail views

**Glassmorphism Patterns:**
- **Cards**: `bg-white/80 backdrop-blur-xl border border-white/20`
- **Navigation**: `bg-slate-900/80 backdrop-blur-md sticky top-0 z-50`
- **Modals**: `bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl`

**Animation Guidelines** (install `framer-motion` when needed):
- **Page Transitions**: Slide up + fade (`y: 20 → 0, opacity: 0 → 1`)
- **Stagger Children**: Delay of 0.05s between list items
- **Transitions**: `duration-200` for hovers, `duration-300` for page changes
- **Micro-interactions**: Scale on hover `hover:scale-[1.02]`, Lift effect `hover:-translate-y-1`

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
- [x] **Frontend: Connect BookingsPage to API**
  - [x] Create `api/bookingApi.js` with axios calls
  - [x] Create `hooks/useBookings.js` with React Query hooks
  - [x] Fetch bookings from `GET /api/v1/bookings`
  - [x] Replace hardcoded table rows with dynamic data
  - [x] Add loading and error states
  - [x] Support dark mode on table, badges, and all states
- [x] **Frontend: New Booking form**
  - [x] Implement modal/page with resource selector, date picker, time picker, purpose field
  - [x] Add form validation (required fields, endTime after startTime)
  - [x] Handle booking conflict error from backend (show user-friendly message)
  - [x] Submit to `POST /api/v1/bookings`
  - [x] Invalidate bookings query on success (React Query)
  - [x] Design with frontend-design skill
- [x] **Frontend: Booking actions**
  - [x] Add cancel button for user's own pending bookings
  - [x] Add approve/reject buttons for admin role
  - [x] Refresh list after action (React Query `invalidateQueries`)
- [x] **Frontend: Dashboard stats integration**
  - [x] Replace hardcoded "Active Bookings: 3" with real count from API
  - [x] Support dark mode on stat cards
- [ ] **Backend: Booking Tests**
  - [ ] Write unit tests for conflict detection
  - [ ] Write integration tests for booking flow
  - [ ] Test edge cases (timezone, DST, etc.)
- [ ] **Frontend: BookingDetailPage**
  - [ ] Create BookingDetailPage (view full booking details)
- [ ] **Frontend: ConflictWarning component**
  - [ ] Create ConflictWarning component for display

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

## Phase 4.5: Room Scheduling + Recurring Bookings (Week 7.5)

- [x] **Backend: Schedule Template Entities**
  - [x] Create `DayOfWeek` enum (MONDAY, TUESDAY, ..., SUNDAY)
  - [x] Create `RoomSchedule` entity: id, roomId, operatingStart, operatingEnd
  - [x] Create `DaySchedule` entity: id, roomScheduleId, dayOfWeek
  - [x] Create `ScheduleBlock` entity: id, dayScheduleId, startHour, endHour, assignedUserId
  - [x] Create repositories for all three entities
- [x] **Backend: Booking Entity Updates**
  - [x] Add `recurringGroupId` (nullable UUID)
  - [x] Add `isOverride` (boolean)
  - [x] Add `parentBookingId` (nullable)
  - [x] Add `equipment` (JSON/string array)
  - [x] Create `RecurringType` enum (NONE, WEEKLY, CUSTOM_DAYS)
  - [x] Add `recurringDays` (JSON array of DayOfWeek)
  - [x] Add `recurringEndDate` (nullable)
- [x] **Backend: Schedule Template API**
  - [x] Create RoomScheduleController endpoints
  - [x] GET /api/schedules/room/{roomId} - Get room's weekly schedule
  - [x] POST /api/schedules/room/{roomId} - Create/update weekly schedule
  - [x] PUT /api/schedules/room/{roomId}/blocks - Add/update blocks
  - [x] DELETE /api/schedules/room/{roomId}/blocks/{blockId} - Remove block
  - [x] ScheduleService: auto-generate bookings for 6 months
  - [x] Conflict detection against template
- [x] **Backend: Recurring Booking Logic**
  - [x] Create RecurringBookingService
  - [x] Expand recurring pattern into individual Booking records
  - [x] Validate 6-month max advance limit
  - [x] Check availability for ALL dates before confirming
  - [x] Detect conflicts with weekly schedule template → mark as override (PENDING)
- [x] **Backend: Override Workflow**
  - [x] Create OverrideService
  - [x] Check if booking conflicts with template
  - [x] Create in-app notification for current slot holder
  - [x] PUT /api/bookings/{id}/approve (ADMIN)
  - [x] PUT /api/bookings/{id}/reject (ADMIN)
- [x] **Backend: Cancellation Logic**
  - [x] Create CancellationService
  - [x] Cancel single instance
  - [x] Cancel from date forward (all future instances)
  - [x] Cancel entire series
  - [x] POST /api/bookings/{id}/cancel with body: scope, reason
- [x] **Backend: Schedule View API**
  - [x] GET /api/schedule/daily?date=&building=&type=
  - [x] GET /api/schedule/room/{roomId}/daily?date=
  - [x] GET /api/schedule/availability?date=&startHour=&endHour=&equipment=
- [ ] **Backend: Tests (SKIPPED)**
  - [ ] Unit tests for recurring booking expansion
  - [ ] Unit tests for override detection
  - [ ] Integration tests for schedule template CRUD
- [x] **Frontend: Schedule Page (Admin)**
  - [x] Create `/admin/schedule` route
  - [x] Create ScheduleGrid component (grouped by building/floor)
  - [x] Filterable by building, type, capacity
  - [x] Click empty cell → pre-filled booking form
  - [x] Click occupied cell → booking detail view
- [x] **Frontend: Booking Form Updates**
  - [x] Add recurring booking toggle
  - [x] Add day-of-week multi-select
  - [x] Add recurring end date picker (max 6 months)
  - [x] Preview section showing all dates
  - [x] Highlight conflicting dates in red
- [x] **Frontend: Cancellation Flow**
  - [x] Create CancelBookingModal component
  - [x] Step 1: Select scope (Instance / Forward / Series)
  - [x] Step 2: Summary of affected bookings
  - [x] Step 3: Confirm button
- [x] **Frontend: Override Notifications**
  - [x] Create OverrideRequestNotification component
  - [x] Add to notification panel
- [x] **Frontend: Room Schedule Template Editor**
  - [ ] Create ScheduleTemplateEditor component
  - [ ] Weekly view (Mon-Sun columns, hourly blocks rows)
  - [ ] Click-to-assign blocks to lecturers
  - [ ] Drag-to-select multiple blocks
- [x] **Frontend: Recurring Bookings UI**
  - [x] Create RecurringBookingCard component
  - [x] Date range display + days of week
  - [x] Total sessions count
  - [x] Group bookings by recurringGroupId
- [x] **Frontend: QR Code Timing Logic**
  - [x] QR button only shows when check-in time (30 min before start)
  - [x] Disabled button for future dates
- [x] **Backend: BookingResponse Updates**
  - [x] Add recurring fields to BookingResponse
  - [x] Update fromEntity() mapping

---

## Phase 5: Admin Dashboard + AI Foundation (Week 8+)

### 5.1 Admin Dashboard
- [x] **Install chart library** (Recharts or Chart.js)
- [ ] Create DashboardStats component
- [ ] Create booking statistics endpoint
- [ ] Create ticket statistics endpoint
- [ ] Create resource utilization chart
- [ ] Create recent activity feed

### 5.2 Additional Features (Optional)
- [x] QR code generation for bookings
- [x] QR code scanner/check-in page
- [ ] Notification preferences (email settings)
- [x] Dark mode toggle
- [ ] Export bookings to CSV (admin)

### 5.3 AI Foundation - Multi-Agent System

**Dependencies:**
```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j</artifactId>
    <version>0.35.0</version>
</dependency>
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
    <version>0.35.0</version>
</dependency>
```

- [ ] **Backend: LangChain Setup**
  - [ ] Create LangChainConfig.java with @Configuration
  - [ ] Create OpenRouterChatModel bean (DeepSeek model)
  - [ ] Configure in application.properties

- [ ] **Backend: Booking Tools**
  - [ ] Create CreateBookingTool with @Tool annotation
  - [ ] Create CancelBookingTool with @Tool annotation
  - [ ] Create ApproveBookingTool with @Tool annotation
  - [ ] Create RejectBookingTool with @Tool annotation
  - [ ] Create QueryBookingsTool with @Tool annotation

- [ ] **Backend: Resource Tools**
  - [ ] Create SearchResourcesTool with @Tool annotation
  - [ ] Create CheckAvailabilityTool with @Tool annotation
  - [ ] Create GetResourceDetailsTool with @Tool annotation

- [ ] **Backend: Ticket Tools**
  - [ ] Create CreateTicketTool with @Tool annotation
  - [ ] Create UpdateTicketStatusTool with @Tool annotation
  - [ ] Create AssignTicketTool with @Tool annotation
  - [ ] Create AddCommentTool with @Tool annotation

- [ ] **Backend: Sub-Agents**
  - [ ] Define BookingAgent system prompt
  - [ ] Create BookingAgent using Agent.builder()
  - [ ] Attach booking tools
  - [ ] Implement handoff mechanism
  - [ ] Define ResourceAgent system prompt
  - [ ] Create ResourceAgent
  - [ ] Define TicketAgent system prompt
  - [ ] Create TicketAgent

- [ ] **Backend: Supervisor Agent**
  - [ ] Define SupervisorAgent system prompt
  - [ ] Wrap sub-agents as tools
  - [ ] Implement handoff communication
  - [ ] Create response synthesis logic
  - [ ] Add intent detection

- [ ] **Backend: Memory System**
  - [ ] Add MessageWindowChatMemory
  - [ ] Configure max messages (10)
  - [ ] Enable per-session conversation context

- [ ] **Backend: REST API**
  - [ ] Create AIController
  - [ ] POST /api/ai/chat - Main chat endpoint
  - [ ] POST /api/ai/booking - Direct to Booking Agent
  - [ ] POST /api/ai/resources - Direct to Resource Agent
  - [ ] POST /api/ai/tickets - Direct to Ticket Agent
  - [ ] Secure endpoints (require authentication)

- [ ] **Frontend: AI Chat**
  - [ ] Create AIChat component
  - [ ] Add chat input UI
  - [ ] Display AI responses
  - [ ] Add loading states
  - [ ] Create useAIChat hook

- [ ] **Frontend: Testing**
  - [ ] Test supervisor routing
  - [ ] Test handoff between agents
  - [ ] Test multi-turn conversations

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

1. **Week 1 (Foundation):** Project skeleton, auth foundation, Docker setup, development environment ready
2. **Week 2 (Facilities):** Resource management with search/filter - browse, search, view resources, admin CRUD
3. **Week 3-4 (Bookings):** Complete booking workflow with conflict detection - full booking lifecycle
4. **Week 5-6 (Tickets):** Maintenance ticket system with attachments - incident management
5. **Week 7 (Notifications):** Real-time notifications + UI polish - loading skeletons, error states, responsive design
6. **Week 8+ (Advanced/AI):** Admin dashboard, AI foundation preparation

### Timeline Summary

| Week | Focus | Key Deliverable |
|------|-------|-----------------|
| 1 | Foundation | Auth works, dev environment ready |
| 2 | Resources | Browse/search resources |
| 3-4 | Bookings | Full booking workflow |
| 5-6 | Tickets | Incident management with files |
| 7 | Notifications + Polish | Real-time updates, UI polish |
| 8 | Advanced/AI | Dashboard, AI prep |

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
