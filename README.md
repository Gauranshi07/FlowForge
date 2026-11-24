# FlowForge

FlowForge is a full-stack project management platform starter built with React, Vite, Node.js, Express, and MongoDB. The client and server are maintained as separate applications.

The backend includes JWT authentication, project management, task management, and dashboard analytics APIs.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB Atlas or another MongoDB deployment

## Installation

From the project root, install each application's dependencies:

```powershell
cd .\client
npm install
cd ..\server
npm install
```

Create a local backend environment file:

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI` and a `JWT_SECRET` of at least 32 characters in `.env`. Do not commit `.env` or put real credentials in `.env.example`.

## Tasks API

All task endpoints require a JWT bearer token:

- `POST /api/tasks` — create a task in a project owned by the authenticated user.
- `GET /api/tasks` — list tasks, optionally filtered by `project`, `status` (`Todo`, `In Progress`, `Done`), and `priority` (`Low`, `Medium`, `High`).
- `GET /api/tasks/:id` — retrieve an owned task.
- `PUT /api/tasks/:id` — update an owned task.
- `DELETE /api/tasks/:id` — delete an owned task.

## Dashboard API

- `GET /api/dashboard/summary` — return authenticated-user project and task statistics, per-project progress, and the five most recently updated tasks.

Run backend validation tests from `server` with `npm run test:unit`. Run the MongoDB-backed task and dashboard integration tests with `npm run test:integration` and `npm run test:dashboard`; the configured MongoDB deployment must be reachable and allow the current IP address.

## Development

Run the client in one terminal:

```powershell
cd .\client
npm run dev
```

Run the server in a second terminal:

```powershell
cd .\server
npm run dev
```

The Vite development server uses port `5173` by default. The Express server uses port `5000` by default; set `PORT` in `server/.env` to change it.

## Production builds

Build the client:

```powershell
cd .\client
npm run build
```

Start the server:

```powershell
cd .\server
npm start
```
