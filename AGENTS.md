# AGENTS.md -- Smart Campus Operations Hub

## Rules for All Contributors (Human and AI)

### 1. One Commit Per Sub-Task

Every sub-task in `TASKS.md` must be committed individually when completed. Do NOT bundle multiple sub-tasks into a single commit.

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

### 3. Branch Naming

Feature branch per task. Format:

```
<type>/<short-description>
```

Examples:
```
feat/resource-dtos
feat/booking-conflict-checking
fix/notification-websocket-reconnect
chore/backend-ci-workflow
docs/api-documentation
```

### 4. Before Committing

- [ ] Run backend: `mvn clean compile` (must succeed)
- [ ] Run frontend: `npm run lint` (must pass)
- [ ] Run frontend: `npm run build` (must succeed)
- [ ] Verify no console errors in browser dev tools
- [ ] Verify dark mode and light mode both render correctly (for frontend changes)

### 5. Architecture Rules

- All service classes must have `@Transactional` at class level
- All controllers must use DTOs -- never expose JPA entities directly
- Use manual DTO mappers (static methods) -- no MapStruct
- Authentication is OAuth2 session-based only -- no JWT
- File uploads stored locally in `uploads/` directory
- Real-time notifications use STOMP WebSocket
- Dev database: H2 with `ddl-auto=update`
- Each database migration is its own `Vx__description.sql` file
- Frontend uses Axios + React Query for all data fetching
- All pages and components must support both dark mode and light mode
- Frontend design uses the frontend-design skill -- no generic AI aesthetics

### 6. Frontend Structure

```
frontend-web/src/
├── api/            # axios instance, API service functions
├── assets/         # images, icons, fonts
├── components/     # shared reusable components
├── context/        # React contexts (AuthContext, ThemeContext)
├── hooks/          # custom hooks (useResources, useBookings, useWebSocket)
├── layouts/        # page layouts (MainLayout)
├── pages/          # route-level page components
├── utils/          # formatters, validators, constants
├── App.jsx
├── main.jsx
└── index.css
```

### 7. Pull Request Rules

- One PR per feature branch
- Link the PR to the relevant task in TASKS.md
- Include screenshots for frontend changes (both dark and light mode)
- Request review from at least one team member
- Do not merge your own PR

### 8. When in Doubt

- Check TASKS.md for the task breakdown and decisions
- Check this file for rules and conventions
- Ask the team before making architectural decisions not covered here
