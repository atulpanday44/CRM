# CRM - Project Structure

## Overview

This project is organized with a clear separation between frontend and backend.

## Root Layout

```
CRM/
├── frontend/               # React + Vite app
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend-spring/         # Spring Boot REST API
│   ├── src/main/java/com/crm/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── domain/
│   │   ├── dto/
│   │   └── security/
│   ├── pom.xml
│   └── src/main/resources/
├── README.md
└── PROJECT_STRUCTURE.md
```

## Frontend (`frontend/`)

### Directory Structure

```
frontend/
├── src/
│   ├── api/                # API layer
│   │   └── client.js
│   ├── config/             # Configuration
│   │   └── api.js
│   ├── components/         # UI components (domain-aligned)
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── leave/
│   │   ├── layout/
│   │   └── sales/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
└── vite.config.js
```

### Frontend ↔ Backend Alignment

| Frontend Module       | Backend (Spring) | Purpose                    |
|-----------------------|------------------|----------------------------|
| `pages/Tasks.jsx`     | TasksController  | Task assignment, progress   |
| `pages/Meetings.jsx`  | MeetingsController | Schedule, participants   |
| `pages/Dashboard.jsx`| Tasks + Meetings | Overview, stats, activity  |
| `components/leave/`   | LeavesController | Leave requests             |
| `components/admin/`   | AccountsController + Sales | User & sales   |
| `components/sales/`   | SalesController  | Clients, pipeline          |
| `context/AuthContext` | AccountsController | Login, JWT               |

## Backend (`backend-spring/`)

Spring Boot app with context path `/api`. Main packages:

- **controller/** — REST endpoints (accounts, tasks, meetings, leaves, sales)
- **service/** — Business logic, role-based access
- **repository/** — JPA repositories
- **domain/** — Entities (User, Task, Meeting, etc.)
- **dto/** — Request/response DTOs
- **security/** — JWT filter, config

## API Base URL

- **Development**: Vite proxies `/api` → `http://localhost:8080`
- **Override**: Create `frontend/.env` with `VITE_API_URL=...`

## Naming Conventions

- **Components**: PascalCase (e.g. `UserManagement.jsx`)
- **Folders**: lowercase (e.g. `admin`, `leave`, `sales`)
- **API client**: `api` object from `api/client.js`
