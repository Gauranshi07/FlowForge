# FlowForge

FlowForge is a full-stack project management platform starter built with React, Vite, Node.js, Express, and MongoDB. The client and server are maintained as separate applications.

This repository contains only the initial project setup. No product features, API routes, database connection, or authentication flows have been implemented yet.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB (needed when database integration is added)

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

Update `.env` with your local configuration when needed. Do not commit `.env` or put real credentials in `.env.example`.

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
