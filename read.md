# Smart Campus - Full Stack Project

A full-stack smart campus platform with a React + Vite frontend and a Spring Boot backend. The system supports resource bookings, equipment management, ticketing, notifications, and user administration.

## Project layout

- frontend-web/ - React + Vite frontend
- smartcampus/ - Spring Boot backend
- docs/ - project docs and diagrams

## Tech stack

- Frontend: React, Vite, React Router, TanStack Query, Tailwind CSS, Axios
- Backend: Spring Boot, Spring Web, Spring Data JPA, Flyway, PostgreSQL

## Prerequisites

- Node.js 20+
- Java 21
- Maven (or use the Maven wrapper)
- PostgreSQL (or a managed PostgreSQL service)

## Quick start

### 1) Backend (Spring Boot)

From the repo root:

```
cd smartcampus
./mvnw spring-boot:run
```

The API starts on http://localhost:8080 by default.

### 2) Frontend (Vite)

From the repo root:

```
cd frontend-web
npm install
npm run dev
```

The web app starts on http://localhost:5173 by default.

## Configuration

Backend config lives in [smartcampus/src/main/resources/application.properties](smartcampus/src/main/resources/application.properties). It loads optional environment files:

- smartcampus/.env
- .env (repo root)

Recommended environment variables (do not commit secrets):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
APP_UPLOAD_DIR=uploads
```

Notes:

- The backend uses Flyway migrations from smartcampus/src/main/resources/db/migration.
- File uploads are stored in the configured upload directory.

## API overview (base paths)

- /api/v1/auth - authentication (Google and local)
- /api/v1/users - user profile lookup
- /api/v1/admin/users - admin user management
- /api/v1/resources - campus resources CRUD and image upload
- /api/v1/bookings - bookings CRUD and approval flow
- /api/v1/equipment - equipment CRUD and room equipment
- /api/v1/tickets - service tickets and attachments
- /api/v1/tickets/{ticketId}/comments - ticket comments
- /api/v1/notifications - notifications and read status

## Scripts

Frontend scripts in [frontend-web/package.json](frontend-web/package.json):

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Deployment notes

- Build frontend with npm run build and serve the output from frontend-web/dist using a static host.
- Package backend with ./mvnw clean package and run the generated jar from smartcampus/target.
- Ensure CORS is configured for the deployed frontend origin.

## Troubleshooting

- If the frontend shows CORS errors, verify the backend is running and reachable at http://localhost:8080.
- If database startup fails, verify credentials and connectivity to PostgreSQL.
