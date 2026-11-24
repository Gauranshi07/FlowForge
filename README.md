# FlowForge – Full-Stack Project Management Platform

FlowForge brings personal project planning and task tracking into one application. Users can organize projects, manage their associated tasks, move work across a Kanban board, and review progress in a live dashboard. The project demonstrates a full-stack application with a React client, a protected REST API, and MongoDB-backed data.

FlowForge currently supports individual authenticated accounts; shared workspaces and team collaboration are not implemented.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)

## Features

- **Authentication:** Register and sign in with email and password. Passwords are hashed with bcrypt, and JWT-protected routes restrict access to authenticated users.
- **Projects:** Create, view, update, and delete projects. Projects include status, priority, description, and optional start and due dates.
- **Tasks:** Create, view, update, and delete tasks associated with a project. Tasks support Todo, In Progress, and Done statuses; Low, Medium, and High priorities; and optional due dates. Access is scoped to the authenticated user's projects and tasks.
- **Kanban board:** View tasks in Todo, In Progress, and Done columns. Dragging a task to another column updates its status through the API.
- **Dashboard analytics:** View project and task totals, task-status counts, completion percentage, per-project progress, and the five most recently updated tasks. Values are calculated from the authenticated user's MongoDB records.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, JavaScript, Vite, React Router, Tailwind CSS |
| UI and interaction | Lucide React, Axios, `@dnd-kit/core` |
| Backend | Node.js, Express.js |
| Database and data models | MongoDB, MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`), bcrypt (`bcryptjs`) |

## Project Architecture

```text
FlowForge/
├── client/
│   ├── src/
│   │   ├── assets/       # Frontend assets
│   │   ├── components/   # Shared forms, cards, dialogs, and route guards
│   │   ├── context/      # Authentication context
│   │   ├── hooks/        # Data-fetching and UI hooks
│   │   ├── layouts/      # Authenticated app and auth layouts
│   │   ├── pages/        # Login, signup, projects, tasks, Kanban, dashboard
│   │   ├── services/     # Axios client and API service functions
│   │   └── utils/        # Client-side utilities
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/       # Environment loading and MongoDB connection
│   │   ├── controllers/  # Authentication, project, task, and dashboard logic
│   │   ├── middleware/   # Authentication, async handling, and errors
│   │   ├── models/       # Mongoose User, Project, and Task models
│   │   ├── routes/       # Express API routes
│   │   └── utils/        # Validation, JWT, and error utilities
│   ├── test/             # Unit and MongoDB integration tests
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

The client and server have separate dependency manifests and are installed and run independently.

## Getting Started

### Prerequisites

- Node.js `20.19+` or `22.12+`
- npm
- A MongoDB connection string for MongoDB Atlas or another reachable MongoDB deployment

### Clone the repository

```bash
git clone https://github.com/Gauranshi07/FlowForge.git
cd FlowForge
```

### Configure and start the backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set the required values described in [Environment Variables](#environment-variables). Start the API:

```bash
npm run dev
```

The API listens on port `5000` by default.

### Install and start the frontend

In a second terminal, from the repository root:

```bash
cd client
npm install
npm run dev
```

Vite serves the client at `http://localhost:5173` by default. The client uses `http://localhost:5000/api` as its default API base URL.

## Environment Variables

The backend loads `server/.env`. The client does not need a local environment file for the default development setup.

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string used by Mongoose. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs; must be at least 32 UTF-8 bytes. |
| `PORT` | No | Express port; defaults to `5000`. |
| `CLIENT_URL` | No | Allowed client origin for CORS; defaults to `http://localhost:5173`. |
| `NODE_ENV` | No | Present in the example environment file as `development`; it is not currently read by the application code. |
| `VITE_API_BASE_URL` | No | Client API base URL; defaults to `http://localhost:5000/api`. Set it in a Vite environment file such as `client/.env.local` only when using a different API URL. |

Example backend values (replace placeholders locally; do not commit real credentials):

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<random-secret-at-least-32-utf-8-bytes>
```

Keep local environment files and credentials private. For MongoDB Atlas, ensure the database is reachable from your machine and its network access rules permit the connection.

## API Reference

All routes below are prefixed with `/api`. Protected routes require:

```http
Authorization: Bearer <JWT>
```

### Authentication

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register an account and return a JWT. | Public |
| `POST` | `/api/auth/login` | Authenticate and return a JWT. | Public |
| `GET` | `/api/auth/me` | Return the current authenticated user. | Protected |

### Projects

All project routes are protected and scoped to the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/projects` | Create a project. |
| `GET` | `/api/projects` | List the user's projects. |
| `GET` | `/api/projects/:id` | Get a project by ID. |
| `PUT` | `/api/projects/:id` | Update a project. |
| `DELETE` | `/api/projects/:id` | Delete a project. |

### Tasks

All task routes are protected. Task access and project association are checked against the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/tasks` | Create a task in an owned project. |
| `GET` | `/api/tasks` | List tasks, optionally filtered by project, status, and priority. |
| `GET` | `/api/tasks/:id` | Get an owned task by ID. |
| `PUT` | `/api/tasks/:id` | Update an owned task. |
| `DELETE` | `/api/tasks/:id` | Delete an owned task. |

Supported list filters are `project`, `status` (`Todo`, `In Progress`, `Done`), and `priority` (`Low`, `Medium`, `High`). For example:

```text
GET /api/tasks?project=<project-id>&status=Done&priority=High
```

### Dashboard and health

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/summary` | Return user-scoped project and task statistics, project progress, and recent tasks. | Protected |
| `GET` | `/api/health` | Report API and database connection status. | Public |

## Screenshots

Screenshots have not been added yet. Replace these named placeholders with genuine captures of the application before submission.

| Screen | Screenshot |
| --- | --- |
| Dashboard analytics | *Dashboard screenshot placeholder* |
| Projects | *Projects screenshot placeholder* |
| Tasks | *Tasks screenshot placeholder* |
| Kanban board | *Kanban screenshot placeholder* |
| Authentication | *Login or signup screenshot placeholder* |

## Testing

Run commands from the indicated application directory.

### Backend unit tests

```bash
cd server
npm run test:unit
```

These tests cover task input and filter validation, including supported values, invalid IDs and fields, and partial updates. This suite does not connect to MongoDB.

### Backend integration tests

```bash
cd server
npm run test:integration
npm run test:dashboard
```

Both integration suites use the MongoDB database configured by `MONGODB_URI`; the database must be running and reachable. The task suite covers CRUD, filters, authentication, validation, and cross-user/project ownership restrictions. The dashboard suite covers calculated statistics, per-project progress, recent-task ordering, user isolation, authentication, and summary updates after API task and project changes. Test records are created with unique identifiers and cleaned up by the suites.

### Frontend production build

```bash
cd client
npm run build
```

The client package currently defines development, build, and preview scripts; it does not define a frontend test script.

## Future Enhancements

The following are planned possibilities and are not implemented features:

- Shared workspaces and team collaboration
- Real-time updates
- Notifications
- Activity logs
