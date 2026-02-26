# Internal CRM System

An internal CRM designed for company management to track and monitor employee work and productivity. The system provides full visibility into tasks, meetings, and activity across the organization with role-based access control.

## Features

### Task Management
- **Admin/HR**: Assign tasks to employees, set deadlines, priorities, and track progress
- **Employees**: Update task status, progress, add work notes, and log activities
- Real-time visibility into pending, overdue, and completed tasks

### Meeting Management
- Schedule meetings with date, time, and location
- Track participants
- Store meeting notes, decisions, and follow-up actions
- View upcoming and past meetings

### Centralized Dashboard
- **Admin/HR**: Overview of all employees' tasks, meetings, and activity
- **Employees**: Personal view of assigned tasks, upcoming meetings, and activity log
- Pending/overdue task counts and performance insights

### Activity Logs
- Employees can log daily work, weekly summaries, and status updates
- Managers can review activity in real time

### Role-Based Access
- **Superadmin/Admin/HR**: Full access to all tasks, meetings, users, leave, and activity
- **Employees**: See only their own data

## Tech Stack

- **Frontend**: React (Vite), React Router, styled-components
- **Backend**: Spring Boot
- **Database**: H2 (in-memory for dev) or **PostgreSQL** (persistent)

## Project Structure

- **Frontend**: `frontend/` — React app (`src/`, components by domain)
- **Backend**: `backend-spring/` — Spring Boot API
- **API**: `frontend/src/api/client.js` + `frontend/src/config/api.js`

## Setup

### Backend (Spring Boot)

1. **Prerequisites**: JDK 17+, Maven.
2. **Quick start (H2 in-memory, no DB install)**:
   ```bash
   cd backend-spring
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
   API runs at **http://localhost:8080/api**. Data is lost on restart.

3. **Connecting to PostgreSQL (persistent data)**:
   - **Install PostgreSQL** (e.g. [postgresql.org](https://www.postgresql.org/download/) or on macOS: `brew install postgresql@16` then `brew services start postgresql@16`).
   - **Easiest way** (creates DB, sets credentials, starts backend):
     ```bash
     cd backend-spring
     ./scripts/run-with-pg.sh
     ```
     On Homebrew, the script uses your Mac username as DB user (`whoami`) and an empty password by default. Override with `DB_USERNAME` / `DB_PASSWORD` if needed.
   - **Manual run**:
     ```bash
     cd backend-spring
     ./scripts/create-db.sh
     DB_USERNAME=$(whoami) DB_PASSWORD= mvn spring-boot:run -Dspring-boot.run.profiles=pg
     ```
   - On first run, Hibernate creates the tables (`ddl-auto: update`), the superadmin is created if env vars are set, and sample data is seeded if the DB is empty. Data persists across restarts.
   - See [backend-spring/README.md](backend-spring/README.md) for more options.

4. **Creating the first superadmin** (cannot be created from the UI):
   - Set environment variables **before** starting the backend (in the same terminal):
     ```bash
     export SUPERADMIN_EMAIL=your-admin@example.com
     export SUPERADMIN_PASSWORD=your-secure-password-min-8-chars
     ```
   - Then start the backend: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
   - On first run, if no user with role `superadmin` exists, one will be created. You can then log in with that email and password.
   - **With the `dev` profile (H2 in-memory), the database is recreated on every restart.** So you must set the env vars again each time you start the backend if you want the superadmin to exist for that run. For a persistent superadmin, use the `pg` (PostgreSQL) profile.
   - **Roles**: Registration always creates a `user`. Only Admin/HR (via User Management) can create users with roles `user`, `hr`, `admin`, `finance`, or `tech_support`. The role `superadmin` cannot be set from the UI or API.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

In dev, the frontend proxies `/api` to `http://localhost:8080` (Spring Boot), so no extra config is needed.

### Environment (optional)

Create `frontend/.env` for production or custom backend:

```
VITE_API_URL=https://your-api.example.com/api
```

## Deploy to production

### Option A: Frontend only on Vercel (simplest)

Deploy the frontend to [Vercel](https://vercel.com) (free, no card). Run the backend locally with H2 when you demo. See **[DEPLOY.md](DEPLOY.md)**.

### Option B: Full deploy — Vercel + Koyeb (requires card)

Frontend on Vercel, backend + Postgres on Koyeb.

### Option C: Railway (trial credit)

1. Go to [railway.com/new](https://railway.com/new) and sign in with GitHub.
2. **Create project** → **Deploy from GitHub** → select `atulpanday44/CRM`.
3. Add **PostgreSQL** (Database → Add PostgreSQL).
4. Add **backend service**: New → GitHub Repo → same repo, set **Root Directory** to `backend-spring`. Railway auto-detects Java/Maven. Add env vars: `DATABASE_URL` (from Postgres connection), `SPRING_PROFILES_ACTIVE=pg`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`. Generate domain.
5. Add **frontend service**: New → GitHub Repo → same repo, set **Root Directory** to `frontend`. Build: `npm ci && npm run build`. Publish: `dist`. Add env: `VITE_API_URL=https://YOUR-BACKEND-URL/api`. Generate domain.
6. **Backend**: Add `CORS_ORIGINS` = your frontend URL.
7. Log in with superadmin email/password.

### Option D: Render (free frontend + DB; backend requires paid plan)

Render’s free tier does **not** support Docker, and the backend uses Docker. Connect repo via Blueprints.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/accounts/users/login` | Login (email, password) |
| `POST /api/accounts/users/register` | Disabled (users created by Admin/HR only) |
| `GET /api/accounts/users` | List users (admin/hr) |
| `GET /api/tasks/tasks` | List tasks (role-based) |
| `POST /api/tasks/tasks` | Create task (admin/hr) |
| `PATCH /api/tasks/tasks/:id` | Update task |
| `POST /api/tasks/tasks/:id/add_note` | Add work note |
| `GET /api/tasks/activities` | List work activities (all for admin/hr) |
| `POST /api/tasks/activities` | Log activity |
| `GET /api/meetings/meetings` | List meetings |
| `POST /api/meetings/meetings` | Create meeting |

## Navigation

- **Home** – Hub with quick links
- **Dashboard** – Overview of tasks, meetings, and activity
- **Tasks** – Assign, view, and update tasks
- **Meetings** – Schedule and view meetings
- **Apply Leave** / **My Leave** / **Leave Management**
- **Admin** – User management, sales (admin/hr only)
