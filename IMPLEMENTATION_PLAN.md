# Smart Campus Operations Hub - Implementation Plan

> **Project**: SLIIT IT3030 PAF Assignment 2026  
> **Stack**: Spring Boot + React + PostgreSQL + Docker  
> **Team**: 3 Full-stack Developers  
> **UI**: shadcn/ui + Tailwind CSS  
> **Auth**: Google + Microsoft OAuth2

---

## Overview

A modern, beautiful facility booking and maintenance management system for a university campus. Built iteratively with mock-data-first approach, transitioning to full-stack integration.

**Design Philosophy**: Vibrant SaaS aesthetic (inspired by Linear, LangChain, Google Material You) - rounded corners, subtle shadows, rich colors, smooth animations. Professional but visually striking.

**Dependency Strategy**: Install dependencies only when needed for each task. No premature installation.

---

## Design System Guidelines

### Visual Aesthetic
- **Style**: Modern SaaS dashboard (Linear + LangChain + Google Material You)
- **Corners**: Large rounded corners (`rounded-2xl`, `rounded-3xl` for cards)
- **Shadows**: Subtle, layered shadows (`shadow-lg`, `shadow-xl` with low opacity)
- **Spacing**: Compact but breathable (not excessive whitespace)
- **Typography**: Inter font, clean hierarchy

### Color Palette
- **Primary**: Indigo/Violet gradient (`from-indigo-500 to-violet-600`)
- **Background**: Slate 50/900 (light/dark modes)
- **Surface**: White with subtle borders (`border-slate-200`)
- **Accents**:
  - Success: Emerald 500
  - Warning: Amber 500
  - Error: Rose 500
  - Info: Blue 500
- **Gradients**: Use sparingly for CTAs and highlights

### Material Design Components
- **Elevation**: Use shadow levels (0dp, 1dp, 2dp, 4dp, 8dp, 16dp)
- **Ripple Effect**: Add to buttons and interactive elements
- **FAB (Floating Action Button)**: For primary actions (`rounded-full shadow-lg`)
- **Chips**: For filters and tags (`rounded-full bg-slate-100`)
- **Bottom Sheets**: For mobile detail views (`rounded-t-3xl`)

### Glassmorphism Patterns
- **Cards**: `bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl`
- **Navigation**: `bg-slate-900/80 backdrop-blur-md sticky top-0 z-50`
- **Modals**: `bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl`
- **Overlays**: Gradients with transparency (`bg-gradient-to-br from-indigo-500/20 to-violet-600/20`)

### Component Patterns
- **Cards**: `rounded-2xl bg-white shadow-sm border border-slate-200 p-6`
- **Buttons**: `rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]`
  - Primary: `bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30`
  - Secondary: `bg-white border border-slate-200 hover:bg-slate-50`
  - Ghost: `hover:bg-slate-100 text-slate-700`
- **Inputs**: `rounded-xl border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`
- **Badges**: `rounded-full px-3 py-1 text-sm font-medium`
- **Tables**: `rounded-2xl overflow-hidden border border-slate-200`

### Animation Guidelines
**Install when needed:**
```bash
npm install framer-motion
```

- **Page Transitions**: Slide up + fade (`y: 20 → 0, opacity: 0 → 1`)
- **Stagger Children**: Delay of 0.05s between list items
- **Transitions**: `duration-200` for hovers, `duration-300` for page changes
- **Easing**: `ease-out` for entrances, `ease-in-out` for interactions
- **Micro-interactions**:
  - Scale on hover: `hover:scale-[1.02]`
  - Lift effect: `hover:-translate-y-1 hover:shadow-lg`
  - Ripple on click (Material Design)
  - Skeleton shimmer for loading states
- **Scroll Animations**: Fade in elements as they enter viewport
- **Number Counting**: Animate stats/dashboard numbers

---

## Phase 0: Foundation Sprint (Week 1)

**Goal**: Project skeleton, auth foundation, and development environment

### 0.1 Backend Setup
- [x] Initialize Spring Boot 3.x project with Spring Initializr
  - [x] Add dependencies: Spring Web, Data JPA, Security, OAuth2 Client, PostgreSQL, Validation, Lombok
  - [x] Configure application.properties for dev profile
  - [x] Setup application-local.properties for local secrets (gitignore)
- [x] Create base entity class (Auditable with createdAt, updatedAt)
- [x] Setup global exception handler (@ControllerAdvice)
- [x] Create API response wrapper (ApiResponse<T>)

### 0.2 Docker & Database Setup
- [x] Create docker-compose.yml with PostgreSQL + pgAdmin
- [x] Create .env for environment variables
- [x] Test database connectivity from Spring Boot
- [x] Create Flyway migrations for database schema:
  - [x] V1__Create_all_tables.sql (rooms, room_resources, bookings, schedules, etc.)
  - [x] V2__Populate_room_resources.sql (equipment for each room)
- [x] Configure Flyway in application.properties:
  - [x] flyway.enabled=true
  - [x] flyway.locations=classpath:db/migration
  - [x] flyway.baseline-on-migrate=true
- [x] Change ddl-auto=update to ddl-auto=validate (Flyway manages schema)
- [x] Rename room_equipment table to room_resources

### 0.3 Authentication & Security
**Dependencies to add:**
```xml
<!-- In pom.xml when implementing this phase -->
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
    <version>0.12.3</version>
</dependency>
```

- [x] Configure Spring Security with OAuth2
- [x] Setup Google OAuth2 credentials (Google Cloud Console)
- [ ] Setup Microsoft OAuth2 credentials (Azure Portal)
- [x] Create Role enum: USER, ADMIN, TECHNICIAN
- [x] Create User entity with fields: id, email, name, role, provider, providerId, avatarUrl
- [x] Implement JWT token generation after OAuth success
- [x] Create JWT filter for request validation
- [x] Configure CORS for frontend
- [x] Create AuthController with endpoints:
  - [x] GET /api/auth/me (current user)
  - [x] POST /api/auth/refresh (refresh token)
  - [x] GET /api/auth/oauth/success (OAuth callback)
- [x] make user endpoints as well. to create user, and stuff.
  - [x] GET /api/admin/users (list all users)
  - [x] GET /api/admin/users/{id}
  - [x] POST /api/admin/users (create user)
  - [x] PUT /api/admin/users/{id} (update user)
  - [x] DELETE /api/admin/users/{id} (delete user)

### 0.4 Frontend Setup (Minimal Start)
- [X] Verify React Router v7 is configured (already done)
- [X] Configure Tailwind CSS (already done)
- [X] Initialize shadcn/ui base: `npx shadcn@latest init`
- [X] Setup folder structure:
  ```
  app/
  ├── components/ui/     # shadcn components
  ├── components/        # custom components
  ├── routes/            # page components
  ├── lib/               # utilities
  └── types/             # TypeScript types
  ```
- [X] Configure path aliases in tsconfig.json (already done)
- [X] Install shadcn components: `button`, `card`
- [X] Install axios: `npm install axios`
- [X] Add custom scrollbar styles and animations to app.css

**Note**: Install additional dependencies only when needed in each phase.

### 0.5 Frontend Auth
**Dependencies added:**
```bash
npm install axios
# @react-oauth/google - add when implementing OAuth
```

- [x] Create auth.ts utility for token management
- [x] Create AuthContext with login/logout/user state
- [X] Create Login page with:
  - [X] Vibrant gradient background with animated floating orbs
  - [X] Glassmorphism card (`bg-white/80 backdrop-blur-2xl`)
  - [X] Large rounded card (`rounded-3xl`)
  - [X] Google OAuth button (custom styled with Material Design ripple effect)
  - [X] Microsoft OAuth button (custom styled)
  - [X] Gradient top border accent
  - [X] Custom campus icon in gradient container
- [x] Setup protected routes (requireAuth loader)
- [x] Configure axios interceptors for JWT
- [x] Create useUser hook
- [x] Role-based redirects after login:
  - [x] USER -> /dashboard
  - [x] ADMIN -> /admin
  - [x] TECHNICIAN -> /technician
- [x] Home page is login screen

### 0.6 DevOps & Tooling
- [x] Setup GitHub repository
- [ ] Configure branch protection rules
- [ ] Create GitHub Actions workflow (build + test)
- [ ] Setup MSW (Mock Service Worker) for frontend mocking
- [x] Create .gitignore for both projects
- [ ] Write initial README with setup instructions

**Deliverable**: Login works, protected routes active, dev environment ready

---

## Phase 1: Facilities Catalogue (Module A) (Week 2)

**Goal**: Resource management with search/filter

### 1.1 Backend - Resource Entity & API
- [ ] Create ResourceType enum (LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT)
- [ ] Create ResourceStatus enum (ACTIVE, OUT_OF_SERVICE)
- [ ] Create Resource entity with fields:
  - id, name, type, capacity, location, description
  - status, availabilityWindows (JSON or embedded)
  - imageUrl, createdAt, updatedAt
- [ ] Create ResourceRepository with:
  - [ ] Pagination method
  - [ ] Filter by type method
  - [ ] Filter by capacity >= method
  - [ ] Filter by location (LIKE) method
  - [ ] Combined search method
- [ ] Create ResourceDTO (Request and Response)
- [ ] Create ResourceService with business logic
- [ ] Create ResourceController with endpoints:
  - [ ] GET /api/resources?page=&size= (PUBLIC or AUTH)
  - [ ] GET /api/resources/{id}
  - [ ] POST /api/resources (ADMIN only)
  - [ ] PUT /api/resources/{id} (ADMIN only)
  - [ ] DELETE /api/resources/{id} (ADMIN only, soft delete)
  - [ ] GET /api/resources/search?type=&capacity=&location=

### 1.2 Backend - Validation & Tests
- [ ] Add @Valid annotations on DTOs
- [ ] Create custom validators if needed
- [ ] Write unit tests for ResourceService
- [ ] Write integration tests for ResourceController
- [ ] Test all endpoints with Postman

### 1.3 Frontend - Resource Components
**Install shadcn components:**
```bash
npx shadcn@latest add card badge button input select dialog
```

- [ ] Create Resource type definition
- [ ] Create ResourceCard component:
  - Large rounded corners (`rounded-2xl`)
  - Hover lift effect (`hover:shadow-lg hover:-translate-y-1`)
  - Vibrant status badges
  - Image with overlay gradient
- [ ] Create ResourceGrid component (responsive grid: 1 col mobile → 3 col desktop)
- [ ] Create ResourceFilters sidebar component
- [ ] Create ResourceDetail modal (`rounded-3xl`)

### 1.4 Frontend - Resource Pages
- [ ] Create ResourcesPage (catalogue with search)
- [ ] Create useResources hook with React Query
- [ ] Create useResourceSearch hook for filtering
- [ ] Create ResourceForm component (for admin)
- [ ] Create AdminResourcesPage (CRUD management)
- [ ] Add pagination UI

### 1.5 Frontend - Image Handling (Basic)
- [ ] Create image upload placeholder
- [ ] Display resource images (fallback for missing images)

**Deliverable**: Browse, search, view resources. Admin can CRUD.

---

## Phase 2: Booking System (Module B) (Week 3-4)

**Goal**: Complete booking workflow with conflict detection

### 2.1 Backend - Booking Entity & Repository
- [x] Create BookingStatus enum (PENDING, APPROVED, REJECTED, CANCELLED)
- [x] Create Booking entity with fields:
  - id, resourceId, userId, startTime, endTime
  - purpose, attendees, status, rejectionReason
  - createdAt, updatedAt
- [x] Create BookingRepository with:
  - [x] Find by userId (my bookings)
  - [x] Find by resourceId and status
  - [x] Find by resourceId and time range (for conflict check)
  - [x] Find all with pagination (admin)
  - [x] Find by status (pending, approved, etc.)

### 2.2 Backend - Conflict Detection
- [x] Create BookingService with conflict detection logic
- [x] Implement overlap check query:
  ```sql
  SELECT * FROM bookings 
  WHERE resource_id = ? 
  AND status = 'APPROVED'
  AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?) OR (start_time <= ? AND end_time >= ?))
  ```
- [x] Create ConflictException for 409 responses
- [x] Validate booking times (no past dates, max 4 hours, etc.)

### 2.3 Backend - Booking API
- [x] Create BookingRequestDTO and BookingResponseDTO
- [x] Create BookingController with endpoints:
  - [x] POST /api/bookings (create, with conflict check)
  - [x] GET /api/bookings/my (my bookings)
  - [x] GET /api/bookings (all bookings, ADMIN)
  - [x] PUT /api/bookings/{id}/approve (ADMIN)
  - [x] PUT /api/bookings/{id}/reject (ADMIN + reason)
  - [x] PUT /api/bookings/{id}/cancel (owner or ADMIN)
  - [x] GET /api/bookings/{id}
- [x] Add @PreAuthorize annotations for role checks

### 2.4 Backend - Booking Tests
- [ ] Write unit tests for conflict detection
- [ ] Write integration tests for booking flow
- [ ] Test edge cases (timezone, DST, etc.)

### 2.5 Frontend - Booking Components
- [x] Install shadcn: calendar, popover, select, badge, alert, dialog
- [x] Create BookingCalendar component (date/time picker)
- [x] Create TimeSlotPicker component
- [x] Create BookingForm component (wizard)
- [x] Create BookingCard component (display booking)
- [x] Create BookingStatusBadge component

### 2.6 Frontend - Booking Pages
- [x] Create NewBookingPage (select resource → select time → confirm)
- [x] Create MyBookingsPage (list with tabs: upcoming, past, cancelled)
- [ ] Create BookingDetailPage (view full details)
- [x] Create AdminBookingsPage (all bookings with filters)
- [x] Create BookingApprovalModal (admin approve/reject)
- [ ] Create ConflictWarning component

### 2.7 Frontend - Booking Hooks
- [x] Create useBookings hook (via bookingApi)
- [x] Create useCreateBooking hook with conflict handling
- [x] Create useUpdateBookingStatus hook
- [x] Create useMyBookings hook

**Deliverable**: Full booking lifecycle works. No double-bookings possible.

---

## Phase 3: Incident Ticketing (Module C) (Week 5-6)

**Goal**: Maintenance ticket system with attachments

### 3.1 Backend - Ticket Entities
- [ ] Create TicketPriority enum (LOW, MEDIUM, HIGH, CRITICAL)
- [ ] Create TicketStatus enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED)
- [ ] Create TicketCategory enum (EQUIPMENT, FACILITY, CLEANING, OTHER)
- [ ] Create Ticket entity with fields:
  - id, resourceId, reporterId, assigneeId
  - category, description, priority, status
  - resolutionNotes, preferredContact
  - createdAt, updatedAt, resolvedAt
- [ ] Create Comment entity:
  - id, ticketId, authorId, content, createdAt, updatedAt

### 3.2 Backend - File Upload
- [ ] Create FileStorageService
- [ ] Configure multipart file upload (max 5MB per file, max 3 files)
- [ ] Create uploads directory structure: `uploads/tickets/{ticketId}/`
- [ ] Validate file types (jpg, jpeg, png)
- [ ] Sanitize filenames (UUID + original extension)
- [ ] Create endpoint: GET /api/tickets/{id}/attachments/{filename}

### 3.3 Backend - Ticket API
- [ ] Create TicketService with business logic
- [ ] Create TicketController with endpoints:
  - [ ] POST /api/tickets (create with attachments)
  - [ ] GET /api/tickets/my (my reported tickets)
  - [ ] GET /api/tickets/assigned (tickets assigned to me)
  - [ ] GET /api/tickets (all tickets, ADMIN)
  - [ ] GET /api/tickets/{id}
  - [ ] PUT /api/tickets/{id}/assign (ADMIN assign technician)
  - [ ] PUT /api/tickets/{id}/status (update status)
  - [ ] POST /api/tickets/{id}/comments (add comment)
  - [ ] PUT /api/tickets/{id}/comments/{commentId} (edit own)
  - [ ] DELETE /api/tickets/{id}/comments/{commentId} (delete own)
- [ ] Implement ownership checks for comments

### 3.4 Backend - Ticket Tests
- [ ] Write unit tests for TicketService
- [ ] Write integration tests for file upload
- [ ] Test comment ownership rules

### 3.5 Frontend - Ticket Components
- [ ] Install shadcn: textarea, select, badge, avatar, separator, scroll-area
- [ ] Create TicketCard component with priority colors
- [ ] Create TicketStatusBadge component
- [ ] Create TicketPrioritySelect component
- [ ] Create FileUpload component (dropzone with 3 file limit)
- [ ] Create ImageGallery component (preview attachments)
- [ ] Create CommentThread component
- [ ] Create CommentForm component
- [ ] Create TicketTimeline component (status history)

### 3.6 Frontend - Ticket Pages
- [ ] Create NewTicketPage (form with resource selector)
- [ ] Create MyTicketsPage (list view)
- [ ] Create TicketDetailPage (full view with comments)
- [ ] Create TechnicianDashboard (assigned tickets, kanban view)
- [ ] Create AdminTicketsPage (all tickets, assignment UI)

### 3.7 Frontend - Ticket Hooks
- [ ] Create useTickets hook
- [ ] Create useCreateTicket hook (with file upload)
- [ ] Create useUpdateTicketStatus hook
- [ ] Create useComments hook

**Deliverable**: Full ticketing workflow. File uploads work.

---

## Phase 4: Notifications (Module D) + Polish (Week 7)

**Goal**: Real-time notifications and UI refinement

### 4.1 Backend - Notifications
- [ ] Create NotificationType enum (BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_OVERRIDE_REQUEST, BOOKING_OVERRIDE_APPROVED, BOOKING_OVERRIDE_REJECTED, TICKET_ASSIGNED, TICKET_RESOLVED, COMMENT_ADDED)
- [ ] Create Notification entity:
  - id, userId, type, title, message, isRead, createdAt
- [ ] Create NotificationRepository
- [ ] Create NotificationService (create notifications on events)
- [ ] Integrate notifications into:
  - [ ] Booking approval/rejection
  - [ ] Ticket assignment
  - [ ] Ticket status changes
  - [ ] Comment creation
  - [ ] Schedule override requests (notify current slot holder when another user requests their slot)
  - [ ] Override approval/rejection (notify requesting user)

### 4.2 Backend - SSE (Server-Sent Events)
- [ ] Create SseController with /api/notifications/stream endpoint
- [ ] Create SseEmitter management (store emitters per user)
- [ ] Implement heartbeat to keep connection alive
- [ ] Handle client disconnections

### 4.3 Backend - Notification API
- [ ] Create endpoints:
  - [ ] GET /api/notifications (my notifications)
  - [ ] PUT /api/notifications/{id}/read
  - [ ] PUT /api/notifications/read-all
  - [ ] DELETE /api/notifications/{id}
  - [ ] GET /api/notifications/unread-count

### 4.4 Frontend - Notifications
- [ ] Install shadcn: sonner (toasts), popover, badge
- [ ] Create NotificationBell component with unread badge
- [ ] Create NotificationPanel component (dropdown)
- [ ] Create NotificationItem component
- [ ] Create useSse hook for real-time updates
- [ ] Create useNotifications hook
- [ ] Add toast notifications for actions

### 4.5 Frontend - Polish
- [ ] Add loading skeletons to all pages
- [ ] Create EmptyState component for no data
- [ ] Add error boundaries
- [ ] Verify responsive design on mobile/tablet
- [ ] Add page transitions
- [ ] Polish loading states and error states

### 4.6 Testing & QA
- [ ] Run through all user flows
- [ ] Test on different screen sizes
- [ ] Verify all endpoints return correct status codes
- [ ] Check accessibility (keyboard navigation, ARIA labels)

**Deliverable**: Real-time notifications. Polished UI.

---

## Phase 4.5: Room Scheduling System (Week 7.5)

**Goal**: Weekly schedule templates, recurring bookings, override workflow, and admin schedule view

### 4.5.1 Backend - Schedule Template Entities
- [x] Create `DayOfWeek` enum (MONDAY, TUESDAY, ..., SUNDAY)
- [x] Create `RoomSchedule` entity:
  - id, roomId (FK to Resource), operatingStart (default 8), operatingEnd (default 20)
  - createdAt, updatedAt
- [x] Create `DaySchedule` entity:
  - id, roomScheduleId (FK to RoomSchedule), dayOfWeek
- [x] Create `ScheduleBlock` entity:
  - id, dayScheduleId (FK), startHour, endHour, assignedUserId (nullable, FK to User)
- [x] Create repositories for all three entities

### 4.5.2 Backend - Booking Entity Updates
- [x] Add to `Booking` entity:
  - `recurringGroupId` (nullable UUID, links instances of a series)
  - `isOverride` (boolean, true if conflicts with weekly template)
  - `parentBookingId` (nullable, for series management)
  - `equipment` (JSON/string array)
- [x] Create `RecurringType` enum (NONE, WEEKLY, CUSTOM_DAYS)
- [x] Add `recurringDays` (JSON array of DayOfWeek)
- [x] Add `recurringEndDate` (nullable)

### 4.5.3 Backend - Schedule Template API
- [x] Create `RoomScheduleController`:
  - [x] GET /api/schedules/room/{roomId} - Get room's weekly schedule
  - [x] POST /api/schedules/room/{roomId} - Create/update weekly schedule
  - [x] PUT /api/schedules/room/{roomId}/blocks - Add/update blocks
  - [x] DELETE /api/schedules/room/{roomId}/blocks/{blockId} - Remove block
- [x] Create `ScheduleService`:
  - [x] Auto-generate bookings for 6 months when template is created/updated
  - [x] Delete future generated bookings when template block is removed
  - [x] Conflict detection against template

### 4.5.4 Backend - Recurring Booking Logic
- [x] Create `RecurringBookingService`:
  - [x] Expand recurring pattern into individual `Booking` records
  - [x] Validate 6-month max advance limit
  - [x] Check availability for ALL dates before confirming
  - [x] Assign same `recurringGroupId` to all instances
- [x] Update `BookingService.createBooking`:
  - [x] Detect conflicts with existing bookings (same room, date, time)
  - [x] Detect conflicts with weekly schedule template → mark as override (PENDING)
  - [x] Support recurring booking creation

### 4.5.5 Backend - Override Workflow
- [x] Create `OverrideService`:
  - [x] Check if booking conflicts with template
  - [x] Create in-app notification for current slot holder
  - [x] Track override requests
- [x] Update `BookingController`:
  - [x] PUT /api/bookings/{id}/approve - Admin approves override
  - [x] PUT /api/bookings/{id}/reject - Admin rejects override
- [x] Update conflict detection to respect override status

### 4.5.6 Backend - Cancellation Logic
- [x] Create `CancellationService`:
  - [x] Cancel single instance
  - [x] Cancel from date forward (all future instances in series)
  - [x] Cancel entire series (all instances with same recurringGroupId)
- [x] Create endpoint: POST /api/bookings/{id}/cancel with body:
  - `scope`: "INSTANCE" | "FORWARD" | "SERIES"
  - `reason` (optional)
- [x] Update status of affected bookings to CANCELLED

### 4.5.7 Backend - Schedule View API
- [x] Create `ScheduleController`:
  - [x] GET /api/schedule/daily?date=2026-04-07&building=&type= - Get day's schedule grid
  - [x] GET /api/schedule/room/{roomId}/daily?date= - Get single room's day
  - [x] GET /api/schedule/availability?date=&startHour=&endHour=&equipment= - Find available rooms
- [x] Response includes:
  - Rooms grouped by building/floor
  - Each room's bookings for the day with status
  - Template assignments vs actual bookings
  - Available/occupied blocks

### 4.5.8 Backend - Tests (SKIPPED)
- [ ] Unit tests for recurring booking expansion
- [ ] Unit tests for override detection
- [ ] Unit tests for cancellation scopes
- [ ] Integration tests for schedule template CRUD
- [ ] Integration tests for booking conflict detection

### 4.5.9 Frontend - Schedule Page (Admin)
- [x] Create `/admin/schedule` route
- [x] Create `ScheduleGrid` component:
  - Grouped by building/floor (collapsible)
  - Filterable by building, type, capacity
  - Rows: rooms, Columns: time blocks (8-9, 9-10, ..., 19-20)
  - Cells: booking info or "Available"
  - Color coding: approved (green), pending (amber), template (blue), available (gray)
- [x] Create `ScheduleDaySelector` component (date picker)
- [x] Click empty cell → pre-filled booking form
- [x] Click occupied cell → booking detail view
- [x] Add filter sidebar
- [x] Added Schedule tab to admin sidebar nav

### 4.5.10 Frontend - Booking Form Updates
- [x] Add recurring booking toggle to existing `BookingForm`
- [x] Add day-of-week multi-select (Mon-Sun checkboxes)
- [x] Add recurring end date picker (max 6 months)
- [x] Add preview section showing all dates that will be booked
- [x] Highlight conflicting dates in red
- [x] Add equipment filter (reuse existing)

### 4.5.11 Frontend - Cancellation Flow
- [x] Create `CancelBookingModal` component:
  - Step 1: Select scope (This instance / From this date forward / Entire series)
  - Step 2: Summary of affected bookings (count, date range)
  - Step 3: Confirm button with warning styling
- [x] Integrate into `BookingCard` and booking detail view

### 4.5.12 Frontend - Override Notifications
- [x] Create `OverrideRequestNotification` component
- [x] Add to notification panel
- [x] Show: "Lecturer B requested your Mon 9-10 slot on [date]"
- [x] Link to booking detail

### 4.5.13 Frontend - Room Schedule Template Editor
- [ ] Create `ScheduleTemplateEditor` component:
  - Weekly view (Mon-Sun columns, hourly blocks rows)
  - Click-to-assign blocks to lecturers
  - Drag-to-select multiple blocks
  - Save/Cancel buttons
- [ ] Integrate into room creation/edit flow (quick setup option)
- [ ] Full editor on `/admin/schedule` page

### 4.5.14 Frontend - Recurring Bookings UI
- [x] Create `RecurringBookingCard` component:
  - [x] Shows combined card for recurring bookings
  - [x] Date range display (first to last occurrence)
  - [x] Time slot + duration
  - [x] Days of week (e.g., "Mon, Wed, Fri")
  - [x] Total sessions count + completed count
  - [x] QR code button for check-in
  - [x] Cancel button with scope options
- [x] Add grouping logic in `bookings.tsx` (user page):
  - [x] Group bookings by recurringGroupId
  - [x] Display recurring cards first, then regular bookings
- [x] Add grouping logic in `bookings/admin.tsx` (admin page):
  - [x] Same grouping as user page
  - [x] Approve/Reject buttons for series

### 4.5.15 QR Code Timing Logic
- [x] QR button only shows when it's check-in time (30 min before start)
- [x] For recurring bookings, QR shows for today's booking if exists
- [x] Otherwise shows disabled button with "QR available on [date]" message
- [x] Update BookingCard.tsx with timing logic
- [x] Update RecurringBookingCard.tsx with timing logic

### 4.5.16 Backend - BookingResponse Updates
- [x] Add recurring fields to BookingResponse:
  - [x] recurringGroupId (UUID)
  - [x] recurringType (String)
  - [x] recurringDays (List<String>)
  - [x] recurringEndDate (LocalDate)
- [x] Update fromEntity() to map recurring fields

### 4.5.17 Backend - Recurring Booking Service Fix
- [x] Fix RecurringBookingService to save recurringDays properly
- [x] Convert String days to DayOfWeek enum before saving
- [x] Save recurringEndDate to each booking instance

**Deliverable**: Weekly schedule templates work. Recurring bookings expand correctly. Override workflow functional. Admin schedule view with grid. User booking flow supports recurring.

---

## Phase 5: Advanced Features + Agentic AI Foundation (Week 8+)

**Goal**: Extra features and AI preparation

### 5.1 Admin Dashboard
- [x] Install chart library (Recharts or Chart.js)
- [ ] Create DashboardStats component
- [ ] Create booking statistics endpoint (bookings per day, top resources)
- [ ] Create ticket statistics endpoint (resolution times, by category)
- [ ] Create resource utilization chart
- [ ] Create recent activity feed

### 5.2 Additional Features (Optional)
- [x] QR code generation for bookings
- [x] QR code scanner/check-in page
- [ ] Notification preferences (email settings)
- [x] Dark mode toggle
- [ ] Export bookings to CSV (admin)

### 5.3 Agentic AI Foundation - Multi-Agent System

> **Goal**: Natural language interface using LangChain4j embedded in Spring Boot
> **Architecture**: Supervisor + Specialized Sub-Agents with Handoff Communication

#### 5.3.0 Prerequisites & Setup

**Dependencies (add to pom.xml):**
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

**Configuration (application.properties):**
```properties
# LangChain4j with OpenRouter (DeepSeek)
langchain4j.openrouter.api-key=${OPENROUTER_API_KEY}
langchain4j.openrouter.model=deepseek/deepseek-chat
langchain4j.openrouter.base-url=https://openrouter.ai/api/v1
langchain4j.openrouter.temperature=0.3
```

**Create config class:**
- [ ] Create LangChainConfig.java with @Configuration
- [ ] Create OpenRouterChatModel bean
- [ ] Allow dynamic API key changes via @Value

#### 5.3.1 Tool Layer (Shared Tools)

##### Booking Tools
- [ ] Create CreateBookingTool with @Tool annotation
- [ ] Create CancelBookingTool with @Tool annotation
- [ ] Create ApproveBookingTool with @Tool annotation (for admin)
- [ ] Create RejectBookingTool with @Tool annotation (for admin)
- [ ] Create QueryBookingsTool with @Tool annotation

##### Resource Tools
- [ ] Create SearchResourcesTool with @Tool annotation
- [ ] Create CheckAvailabilityTool with @Tool annotation
- [ ] Create GetResourceDetailsTool with @Tool annotation

##### Ticket Tools
- [ ] Create CreateTicketTool with @Tool annotation
- [ ] Create UpdateTicketStatusTool with @Tool annotation
- [ ] Create AssignTicketTool with @Tool annotation
- [ ] Create AddCommentTool with @Tool annotation

#### 5.3.2 Sub-Agents (Phase-A)

##### Phase A: Booking Agent (Priority 1)
- [ ] Define BookingAgent system prompt
- [ ] Create BookingAgent using Agent.builder()
- [ ] Attach booking tools: createBooking, cancelBooking, queryBookings
- [ ] Implement handoff mechanism
- [ ] Add smart suggestions for missing info

##### Phase B: Resource Agent (Priority 2)
- [ ] Define ResourceAgent system prompt
- [ ] Create ResourceAgent using Agent.builder()
- [ ] Attach resource tools: searchResources, checkAvailability
- [ ] Implement handoff mechanism
- [ ] Add resource recommendation logic

##### Phase C: Ticket Agent (Priority 3)
- [ ] Define TicketAgent system prompt
- [ ] Create TicketAgent using Agent.builder()
- [ ] Attach ticket tools: createTicket, updateStatus, assign, comment
- [ ] Implement handoff mechanism

#### 5.3.3 Supervisor Agent
- [ ] Define SupervisorAgent system prompt
- [ ] Wrap sub-agents as tools with @Tool
- [ ] Implement handoff communication logic
- [ ] Create response synthesis logic
- [ ] Add intent detection

#### 5.3.4 Memory System (Phase B+)
- [ ] Add MessageWindowChatMemory to Supervisor
- [ ] Configure max messages (10)
- [ ] Enable per-session conversation context
- [ ] Test multi-turn conversations

#### 5.3.5 REST API Endpoints
- [ ] Create AIController
- [ ] POST /api/ai/chat - Main chat endpoint
- [ ] POST /api/ai/booking - Direct to Booking Agent
- [ ] POST /api/ai/resources - Direct to Resource Agent
- [ ] POST /api/ai/tickets - Direct to Ticket Agent
- [ ] Add request/response DTOs
- [ ] Secure endpoints (require authentication)

#### 5.3.6 Frontend Integration 
- [ ] Create AIChat component
- [ ] Add chat input UI
- [ ] Display AI responses
- [ ] Add loading states
- [ ] Create useAIChat hook

#### 5.3.7 Testing
- [ ] Test supervisor routing
- [ ] Test handoff between agents
- [ ] Test multi-turn conversations with memory
- [ ] Test smart suggestions
- [ ] Test error handling

#### 5.3.8 Recurring Bookings (Future Extension)
- [ ] Add RecurringType enum (NONE, WEEKLY, BIWEEKLY, MONTHLY)
- [ ] Add repeatWeeks field to Booking entity
- [ ] Modify BookingService to expand recurring into individual bookings
- [ ] Add validation for recurring bookings
- [ ] Create recurring booking endpoint

---

### Architecture Diagram

```
                        ┌─────────────────┐
                        │    Supervisor   │ ← Handoffs to sub-agents
                        │     Agent       │   Synthesizes responses
                        └────────┬────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
  │   Booking    │        │   Resource   │        │   Ticket     │
  │    Agent     │        │    Agent     │        │    Agent     │
  │              │        │              │        │              │
  │ Tools:       │        │ Tools:       │        │ Tools:       │
  │ - create     │◄───────│ - search     │        │ - create     │
  │ - cancel     │  Handoff│ - avail     │        │ - update     │
  │ - approve    │        │ - details    │        │ - assign     │
  │ - query      │        │              │        │ - comment    │
  └──────────────┘        └──────────────┘        └──────────────┘
```

---

### Example Conversation Flow

```
User: "Book me Lab 101 for tomorrow 2pm"

Supervisor → BOOKING_AGENT (handoff)
  "Create booking: Lab 101, tomorrow 2pm-4pm"

Booking Agent → createBooking tool → API
  Returns: "Booking #123 created, pending approval"

Supervisor → User:
  "I've created booking #123 for Lab 101 tomorrow (March 9) 
   from 2:00 PM to 4:00 PM. Status: Pending approval."
```

```
User: "Book me a lab for 10 students tomorrow"

Supervisor → BOOKING_AGENT (handoff)
  "Create booking: lab, tomorrow, 10 students"

Booking Agent:
  Missing info: Which lab? What time?
  Returns: "I need more details:
   - Which lab? (Lab 101, 102, 103 available)
   - What time?"

Supervisor → User:
  "I found labs for 10 students. Which do you prefer?
   - Lab 101 (30 seats, projector)
   - Lab 102 (20 seats, smartboard)
   Or tell me your preferred time and I'll check availability."
```

### File Structure

```
smart-campus/src/main/java/com/sliit/it3030/smartcampus/
└── agent/
    ├── SupervisorAgent.java
    ├── config/
    │   └── LangChainConfig.java
    ├── subagents/
    │   ├── BookingAgent.java
    │   ├── ResourceAgent.java
    │   └── TicketAgent.java
    ├── tools/
    │   ├── booking/
    │   │   ├── CreateBookingTool.java
    │   │   ├── CancelBookingTool.java
    │   │   ├── ApproveBookingTool.java
    │   │   ├── RejectBookingTool.java
    │   │   └── QueryBookingsTool.java
    │   ├── resource/
    │   │   ├── SearchResourcesTool.java
    │   │   ├── CheckAvailabilityTool.java
    │   │   └── GetResourceDetailsTool.java
    │   └── ticket/
    │       ├── CreateTicketTool.java
    │       ├── UpdateTicketStatusTool.java
    │       ├── AssignTicketTool.java
    │       └── AddCommentTool.java
    ├── dto/
    │   ├── ChatRequest.java
    │   └── ChatResponse.java
    └── controller/
        └── AIController.java
```

### 5.4 Future AI Ideas
- [ ] Ticket auto-categorization (ML/NLP)
- [ ] Smart resource recommendations
- [ ] Predictive maintenance alerts
- [ ] Chat interface for natural language interactions

---

## Work Distribution (Team of 3)

### Member A (Backend Lead + DevOps)
**Primary Modules**: Phase 0, Phase 1, Phase 4 (backend)
- [ ] Project setup, Docker, CI/CD
- [ ] Database schema design
- [ ] Resource API (8+ endpoints)
- [ ] Notifications API + SSE
- [ ] Code review for others

**Endpoints tally**: GET/POST/PUT/DELETE resources, GET/POST/PUT notifications, SSE stream

### Member B (Full-stack - Bookings)
**Primary Modules**: Phase 2, Phase 4 (frontend notifications)
- [ ] Booking system (frontend + backend)
- [ ] Conflict detection logic
- [ ] Calendar/time picker UI
- [ ] Notification UI components
- [ ] Shared: Auth context

**Endpoints tally**: POST booking, GET my bookings, PUT approve/reject/cancel, GET bookings

### Member C (Full-stack - Tickets)
**Primary Modules**: Phase 0 (frontend), Phase 3
- [ ] Frontend setup, shadcn config
- [ ] Ticket system (frontend + backend)
- [ ] File upload handling
- [ ] Comment system
- [ ] Technician dashboard

**Endpoints tally**: POST ticket, PUT status, POST/PUT/DELETE comment, GET attachments

---

## Technical Architecture

### Database Schema
```sql
users (id, email, name, role, provider, provider_id, created_at)
rooms (id, name, capacity, floor, building_name, room_type, created_at, updated_at)
room_resources (room_id, resource) -- equipment for each room
room_schedules (id, room_id, operating_start, operating_end, created_at, updated_at)
day_schedules (id, room_schedule_id, day_of_week)
schedule_blocks (id, day_schedule_id, start_hour, end_hour, assigned_user_id)
bookings (id, room_id, user_id, start_time, end_time, status, purpose, attendees, room_name, booking_code, rejection_reason, checked_in_at, is_override, parent_booking_id, recurring_group_id, recurring_type, recurring_days, recurring_end_date, created_at, updated_at)
booking_recurring_days (booking_id, day_of_week)
booking_equipment (booking_id, equipment)
tickets (id, resource_id, reporter_id, assignee_id, category, description, priority, status, resolution_notes, contact, created_at, resolved_at)
ticket_comments (id, ticket_id, author_id, content, created_at, updated_at)
notifications (id, user_id, type, title, message, is_read, created_at)
ticket_attachments (id, ticket_id, filename, path, created_at)
```

### API Design Principles
- RESTful URLs (nouns, not verbs)
- HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 500
- Consistent response format: `{ "data": ..., "message": ..., "timestamp": ... }`
- Pagination: `?page=0&size=20`
- Filtering: `?status=PENDING&type=LAB`

### Security Checklist
- [ ] OAuth2 login only (no local auth)
- [ ] JWT validation on all protected endpoints
- [ ] @PreAuthorize on admin endpoints
- [ ] Input validation on all DTOs (@Valid)
- [ ] SQL injection protection (JPA params)
- [ ] XSS protection (React escapes by default)
- [ ] File upload: validate type (jpg/png), size limit (5MB), sanitize filename
- [ ] CORS configured properly

---

## Development Workflow

### Git Strategy
- [ ] Main branch: production-ready
- [ ] Develop branch: integration
- [ ] Feature branches: `feature/module-a-resources`
- [ ] PR required for merge, 1 reviewer minimum
- [ ] Each member commits to their own branches

### Commit Convention
```
feat: add resource search endpoint
fix: booking conflict detection bug
docs: update API documentation
test: add booking controller tests
refactor: extract validation logic
```

### Definition of Done
- [ ] Feature works end-to-end
- [ ] Unit tests written (backend)
- [ ] Manual testing done (frontend)
- [ ] No console errors
- [ ] Responsive design verified
- [ ] PR reviewed and approved

---

## Timeline Summary

| Week | Focus | Key Deliverable |
|------|-------|-----------------|
| 1 | Foundation | Auth works, dev environment ready |
| 2 | Resources | Browse/search resources |
| 3-4 | Bookings | Full booking workflow |
| 5-6 | Tickets | Incident management with files |
| 7 | Notifications + Polish | Real-time updates, UI polish |
| 8 | Advanced/AI | Dashboard, AI prep |

---

## Submission Checklist

### Code
- [ ] GitHub repository with clear README
- [ ] All core features implemented
- [ ] Each member has 4+ endpoints
- [ ] GitHub Actions CI/CD working
- [ ] Clean commit history

### Documentation
- [ ] Architecture diagrams (system, API, frontend)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Requirements document (functional & non-functional)
- [ ] Testing evidence (unit tests, Postman collection)
- [ ] Team contribution summary

### Demo
- [ ] Screenshots of all key workflows
- [ ] Video demo (5-10 minutes)
- [ ] Running system locally

---

## Notes

- Start with mock data for frontend, swap to real API as endpoints are ready
- Focus on core features first, advanced features are bonus
- Regular team syncs (daily standups recommended)
- Commit frequently, push daily
- Document as you build
