# Internal CRM – Spring Boot Backend

This is the **Spring Boot** backend for the Internal CRM project. The React frontend talks to this API.

## Tech stack

- **Java 17**, **Spring Boot 3.2**
- **Spring Data JPA**, **PostgreSQL** (or H2 for quick local run)
- **Spring Security** + **JWT** (jjwt)
- **Lombok**, **Validation**

## Prerequisites

- JDK 17+
- Maven 3.6+
- PostgreSQL (optional; can use H2 for development)

## Quick start

### 1. Using PostgreSQL (recommended for production-like setup)

Create a database:

```bash
createdb internal_crm
```

Set environment variables (or create `application-local.yml` / use `.env`):

```bash
export DB_URL=jdbc:postgresql://localhost:5432/internal_crm
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-256-bit-secret-at-least-32-characters-long
```

### 2. Using H2 (no PostgreSQL)

To use in-memory H2, run with a profile that overrides the datasource. For example add `src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:crmdb
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

Then run:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Build and run

```bash
cd backend-spring
./mvnw spring-boot:run
```

The API is served at **http://localhost:8080/api** (context path is `/api`).

### 4. Point the frontend to this backend

- **Option A – Vite proxy**  
  In `frontend/vite.config.js`, set the proxy target to `http://localhost:8080` so that `/api` is forwarded to the Spring app.

- **Option B – Env variable**  
  In `frontend/.env`:
  ```env
  VITE_API_URL=http://localhost:8080/api
  ```
  Then run the frontend and use the app; it will call the Spring backend.

## API overview

API base path: **`/api`**.

| Area        | Examples |
|------------|----------|
| Auth       | `POST /api/accounts/users/login`, `POST /api/accounts/users/register`, `GET /api/accounts/users/me` |
| Users      | `GET/POST/PATCH/DELETE /api/accounts/users`, `GET /api/accounts/users/{id}` |
| Tasks      | `GET/POST/PATCH/DELETE /api/tasks/tasks`, `POST /api/tasks/tasks/{id}/add_note`, `GET/POST /api/tasks/activities` |
| Meetings   | `GET/POST/PATCH/DELETE /api/meetings/meetings` |
| Leaves     | `GET/POST/PATCH/DELETE /api/leaves/requests`, `POST /api/leaves/requests/{id}/update_status`, `GET /api/leaves/requests/pending`, `GET /api/leaves/requests/my_leaves` |
| Sales      | `GET/POST/PATCH/DELETE /api/sales/clients`, `POST /api/sales/clients/{id}/update_status`, `GET /api/sales/clients/analytics`, `GET /api/sales/services`, `GET/POST /api/sales/follow-ups`, `POST /api/sales/follow-ups/{id}/toggle_done`, `GET/POST /api/sales/activities` |

Login request/response:

- **Request:** `POST /api/accounts/users/login` with `{ "email": "...", "password": "..." }`
- **Response:** `{ "access": "<jwt>", "refresh": "<jwt>", "user": { ... } }`

Use the `access` token in the `Authorization: Bearer <access>` header for protected endpoints.

## Creating the first user

There is no built-in CLI user creation. Options:

1. **Register**  
   Call `POST /api/accounts/users/register` with `username`, `email`, `password`, `password2`, and optionally `role` (e.g. `admin`). Then log in with `POST /api/accounts/users/login`.

2. **Seed data**  
   Add an `ApplicationRunner` or a one-off script that creates an admin user (encode password with `BCryptPasswordEncoder`) and saves it via your `UserRepository`.

## Configuration

| Property / env       | Description |
|----------------------|-------------|
| `server.port`        | Server port (default `8080`) |
| `server.servlet.context-path` | API prefix (default `/api`) |
| `DB_URL`             | JDBC URL (default PostgreSQL `internal_crm`) |
| `DB_USERNAME` / `DB_PASSWORD` | DB credentials |
| `JWT_SECRET`         | Secret for signing JWTs (min 256 bits / 32 chars) |
| `jwt.access-validity-ms` | Access token validity (default 15 min) |
| `jwt.refresh-validity-ms` | Refresh token validity (default 7 days) |

## Project layout

```
backend-spring/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/crm/
    │   ├── CrmApplication.java
    │   ├── config/          # Security, UserDetails, CORS, data loader
    │   ├── controller/      # REST: accounts, tasks, meetings, leaves, sales
    │   ├── domain/           # JPA entities
    │   ├── dto/              # Request/response DTOs
    │   ├── exception/        # Global exception handler
    │   ├── repository/       # JPA repositories
    │   ├── security/         # JWT filter, config, props
    │   └── service/          # Business logic
    └── resources/
        └── application.yml
```

## Running tests

```bash
./mvnw test
```

Use an in-memory DB or test containers in tests so the suite does not depend on a running PostgreSQL instance.
