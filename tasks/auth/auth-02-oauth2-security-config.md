# Task auth-02 — SecurityConfig + Google OAuth2 Flow + JWT Redirect

## Goal
Wire Spring Security to permit public routes, configure Google OAuth2 login, and on successful login generate a JWT and redirect the user to the React frontend with it.

## Prerequisite
auth-01

## Context
- `JwtTokenProvider` + `JwtAuthFilter` from auth-01
- `entity/User.java` — needs to be created/updated from Google profile on first login
- `repository/UserRepository.java` — needs `findByEmail(String email)` method
- Package: `com.campushub.smartcampus.config` and `com.campushub.smartcampus.security`
- Frontend OAuth2 callback URL: `http://localhost:5173/auth/callback?token=<jwt>` (from `app.frontend-url`)
- Spring Boot 4 / Spring Security 7 — use lambda DSL, no `WebSecurityConfigurerAdapter`

## What to build
- `security/CustomOAuth2UserService.java` (new)
- `security/OAuth2AuthSuccessHandler.java` (new, implements `AuthenticationSuccessHandler`)
- `config/SecurityConfig.java` (new)
- `controller/AuthController.java` (new)
- `repository/UserRepository.java` (modify) — add `findByEmail`

## Steps
1. Add `Optional<User> findByEmail(String email)` to `UserRepository` if not present.
2. `CustomOAuth2UserService extends DefaultOAuth2UserService`:
   - Override `loadUser(OAuth2UserRequest)` → call `super.loadUser()` to get Google attributes
   - Extract: `email`, `name`, `picture` (profile image), `sub` (providerId)
   - `userRepository.findByEmail(email)`:
     - If exists: update `name` + `profileImageUrl` if changed; save
     - If not: create new `User` with `role=USER`, `provider=GOOGLE`, `providerId=sub`; save
   - Return a `DefaultOAuth2User` wrapping the saved user's email as principal name
3. `OAuth2AuthSuccessHandler`:
   - `onAuthenticationSuccess(request, response, auth)`: extract user email from `auth.getName()`, load from DB, call `jwtTokenProvider.generateToken(user)`, redirect to `frontendUrl + "/auth/callback?token=" + jwt`
4. `SecurityConfig` (`@Configuration @EnableWebSecurity`):
   - `@Bean SecurityFilterChain`:
     - Disable CSRF (stateless JWT API)
     - `sessionManagement` → `STATELESS`
     - Permit: `/oauth2/**`, `/api/v1/auth/**`, `/uploads/**`, `/h2-console/**` (dev)
     - Authenticate all other `/api/**` requests
     - Add `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`
     - Configure `oauth2Login()` with `userInfoEndpoint` → `customOAuth2UserService`, `successHandler` → `oAuth2AuthSuccessHandler`
   - `@Bean CorsConfigurationSource`: allow `http://localhost:5173`, all methods, `Authorization` header
5. `AuthController` at `/api/v1/auth`:
   - `GET /me` — reads `Authentication` from `SecurityContextHolder`, loads user by email, returns `UserDTO` (id, name, email, role, profileImageUrl)
   - `GET /users?role=TECHNICIAN` — returns `List<UserDTO>` filtered by role (admin use for ticket assign dropdown)
6. `UserDTO`: `id`, `name`, `email`, `role`, `profileImageUrl`.

## Verification
1. Start backend. Visit `http://localhost:8080/oauth2/authorization/google` — redirects to Google login.
2. After login → redirected to `http://localhost:5173/auth/callback?token=<jwt>`.
3. Use that token:
   ```bash
   curl http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer <jwt>"
   # → {id, name, email, role: "USER", profileImageUrl}
   ```
4. Unauthenticated request to `/api/v1/bookings` → 401.

## When done
Mark `- [x] auth/auth-02` in `tasks/PROGRESS.md`.
