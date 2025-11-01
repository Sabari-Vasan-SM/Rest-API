# Rest-API (Node + Express + SQLite)

A minimal, easy-to-run REST API demo with a small browser client. The project demonstrates a full CRUD API for users, persistence with SQLite, and JWT-based authentication with a simple client UI to exercise the endpoints.

This repo is ideal for learning, prototyping, or using as a starter template.

----

## Features

- RESTful API endpoints for users: GET (list & single), POST, PUT, DELETE
- SQLite persistence (local `data.db`) via `db.js` (async helpers)
- JWT authentication: signup (`/auth/signup`) and login (`/auth/login`) using bcrypt-hashed passwords
- Protected write operations: create, update, delete require a Bearer token
- Single-file static client in `client/index.html` demonstrating the API and auth flow
- Simple, idempotent runtime migration: if `password` column is missing it will be added automatically
- Small, dependency-light stack: Express, sqlite3, bcryptjs, jsonwebtoken

## Contents

- `server.js` — Express app, serves the client and mounts API and auth routes
- `db.js` — SQLite helper (init, getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser)
- `auth.js` — signup/login routes and `requireAuth` middleware
- `client/index.html` — small web UI to interact with the API (Signup, Login, Get/Create/Update/Delete)
- `package.json` — dependencies and start script

## API — Endpoints

Base URL: http://localhost:5000 (or PORT you start the server on)

Public endpoints:

- GET /api/users — list all users (public)
- GET /api/users/:id — get single user by id (public)
- POST /auth/signup — create account (body: { name, email, password })
- POST /auth/login — login (body: { email, password }) -> returns { token, user }

Protected endpoints (require Authorization: Bearer <token>):

- POST /api/users — create a user (body: { name, email })
- PUT /api/users/:id — update user (body: { name, email })
- DELETE /api/users/:id — delete user

Notes:
- JWT token expires (configured in `auth.js`, default 12h). Use `JWT_SECRET` env var to override the secret (do not use default in production).

## Getting started (local development)

1. Install dependencies

```powershell
cd D:\PROJECTS\Rest-API
npm install
```

2. Start the server

```powershell
# default port 5000
node .\server.js

# to run on another port (PowerShell example):
$env:PORT=5003; node .\server.js
```

3. Open the client in your browser

- Visit http://localhost:5000/ (or the port you used). The client demonstrates signup/login and protected CRUD operations.

4. Example curl flows

Signup:

```powershell
curl -X POST -H "Content-Type: application/json" -d '{"name":"Sam","email":"sam@example.com","password":"pass"}' http://localhost:5000/auth/signup
```

Login (returns token):

```powershell
curl -X POST -H "Content-Type: application/json" -d '{"email":"sam@example.com","password":"pass"}' http://localhost:5000/auth/login
```

Use token to create a user (replace <TOKEN>):

```powershell
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"name":"Bob","email":"bob@example.com"}' http://localhost:5000/api/users
```

## Database & migrations

- The app stores data in `data.db` next to the project root. On first run `db.js` will create the `users` table if missing.
- If the repo previously created a `users` table without a `password` column, the app will attempt a safe `ALTER TABLE users ADD COLUMN password TEXT` to add the new column. This is idempotent and intended for local/dev convenience.
- For production, use a proper migration tool (knex/umzug) and a production-grade RDBMS (Postgres/MySQL) instead of runtime ALTERs.

## Environment variables

- `PORT` — optional, port to run the server on (default 5000)
- `JWT_SECRET` — secret used to sign tokens (default `dev_jwt_secret` in dev; override in production)

Example (PowerShell):

```powershell
$env:JWT_SECRET = 'your-production-secret'
$env:PORT = 5000
node .\server.js
```

## Tests

- No automated tests included yet. Recommended next steps: add Jest + Supertest for endpoint/integration tests and a test DB (in-memory sqlite or separate test file).

## Security notes

- Passwords are hashed with bcrypt (via `bcryptjs`) before being stored.
- Do not commit production secrets (JWT_SECRET) or share your `data.db` publicly.
- Rate-limiting, input validation, helmet, and CSRF protections are recommended if you expose the app publicly.

## Next steps / improvements (suggested)

- Add express-validator or Joi to validate inputs and return structured errors.
- Add OpenAPI/Swagger docs and serve them from `/docs`.
- Add migrations (knex/umzug) and a proper dev/CI test harness.
- Move to Postgres for production use and add connection pooling.
- Add tests (Jest + Supertest) for auth flows and CRUD operations.

## Contribution

Contributions welcome — open an issue or a pull request. Keep changes minimal and include tests when possible.

----

If you'd like, I can also:

- Add a small `CONTRIBUTING.md` and `CHANGELOG.md`.
- Add basic tests for the auth flow and protected endpoints (Jest + Supertest).
- Add Swagger docs for easy manual testing.

Enjoy — this repo is intentionally small and focused so you can extend it as needed.
