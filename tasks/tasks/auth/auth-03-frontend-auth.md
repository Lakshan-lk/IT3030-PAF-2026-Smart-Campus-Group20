# Task auth-03 — Frontend Auth (AuthContext + Login + Protected Routes)

## Goal
Add JWT-based auth to the React app: AuthContext storing the current user, a login page with Google sign-in button, protected routes that redirect unauthenticated users, and role-based navbar visibility.

## Prerequisite
auth-02 (backend OAuth2 + JWT working)

## Context
- `frontend-web/src/App.jsx` — main router
- `frontend-web/src/pages/LoginPage.jsx` — exists, likely placeholder
- `frontend-web/src/api/axios.js` — add JWT interceptor here
- `frontend-web/src/context/ThemeContext.jsx` — pattern to follow for context
- No auth library needed — plain React Context + localStorage

## What to build
- `frontend-web/src/context/AuthContext.jsx` (new)
- `frontend-web/src/pages/LoginPage.jsx` (modify)
- `frontend-web/src/pages/AuthCallbackPage.jsx` (new) — handles `/auth/callback?token=`
- `frontend-web/src/components/ProtectedRoute.jsx` (new)
- `frontend-web/src/api/axios.js` (modify) — attach JWT header
- `frontend-web/src/App.jsx` (modify) — wrap with AuthProvider, add protected + callback routes

## Steps
1. `AuthContext.jsx`:
   - State: `user` (null or `{id, name, email, role, profileImageUrl}`), `token` (string), `loading` (bool)
   - On mount: read `token` from `localStorage`; if present call `GET /api/v1/auth/me` to verify + populate `user`
   - `login(token)`: save to localStorage, call `/auth/me`, set `user`
   - `logout()`: clear localStorage + state
   - Export `useAuth()` hook
2. `axios.js`: add request interceptor — if `localStorage.getItem('token')` exists, set `Authorization: Bearer <token>` on every request.
3. `AuthCallbackPage.jsx` (route `/auth/callback`):
   - On mount: read `?token=` from URL params → call `auth.login(token)` → navigate to `/dashboard`
4. `LoginPage.jsx`: centered card with app logo, "Sign in with Google" button. Button href = `http://localhost:8080/oauth2/authorization/google`. Show spinner if `loading`.
5. `ProtectedRoute.jsx`: wraps a route; if `!user && !loading` → redirect to `/login`; else render children.
6. `App.jsx`:
   - Wrap all routes in `<AuthProvider>`
   - Add route: `/auth/callback` → `AuthCallbackPage` (public)
   - Wrap all feature routes in `<ProtectedRoute>`
   - Add admin-only route guard: `<ProtectedRoute requiredRole="ADMIN">` — redirect non-admins to `/dashboard`
7. `Navbar.jsx` / `AdminNavbar.jsx`: read `useAuth()` → show user avatar + name; show "Admin" link only if `user.role === 'ADMIN'`; "Logout" button calls `auth.logout()` → navigate to `/login`.

## Verification
1. Visit `http://localhost:5173` while logged out → redirect to `/login`
2. Click "Sign in with Google" → Google flow → redirected to `/auth/callback?token=...` → lands on `/dashboard` logged in
3. Navbar shows user name + avatar
4. `localStorage.token` contains JWT
5. On page refresh: still logged in (token persists)
6. Logout → redirected to `/login`, token cleared

## When done
Mark `- [x] auth/auth-03` in `tasks/PROGRESS.md`.
