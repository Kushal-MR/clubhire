# ClubHire: RVCE Club Recruitment Portal

A full-stack web app where RVCE clubs post recruitment openings and students apply and track their application from **Applied → Shortlisted → Interview → Selected**.

**Stack:** HTML, CSS, JavaScript (frontend) · Node.js + Express (backend) · MongoDB + Mongoose (database) · express-session + bcryptjs (login)

## Features
- **Students:** sign up, log in, browse and search openings, apply with a message, track each application on a progress stepper and timeline, withdraw before shortlisting.
- **Club admins:** create, edit, close/reopen and delete openings (full CRUD); view applicants; move them to the next stage with a note the student can see; reject.
- **Role-based access:** students and admins see different pages and APIs. Admins can only touch their own club's data. Admin accounts can't be self-registered.
- **Validation on both sides:** form checks in the browser, and the same checks again on the server, with clear error messages.

## How to run
Requirements: Node.js 18+, MongoDB Community Server running locally (or a MongoDB Atlas URI).

**Windows, one click:** double-click `setup.bat` once (installs packages, creates `.env`, adds demo data), then `start.bat` (starts the server and opens http://localhost:5050). Close the server window to stop it.

**Any OS, manual:**
```bash
npm install                 # install dependencies
cp .env.example .env        # on Windows: copy .env.example .env
npm run seed                # create sample clubs, admins, students, openings
npm start                   # http://localhost:5050
```

**API test:** with the server running, double-click `scripts/run-smoke-test.bat`. It runs 28 end-to-end API checks (auth, CRUD, validation, role/club permissions, status rules), then resets the demo data.

Demo logins (password for all: `password123`):
| Role | Email |
|---|---|
| Student | student@rvce.edu.in |
| Admin (Coding Club) | coding@rvce.edu.in |
| Admin (Rotaract) | rotaract@rvce.edu.in |

## Project structure
```
server.js              Express app: middleware, routes, error handler
seed.js                sample data
config/db.js           MongoDB connection
models/                Mongoose schemas: User, Club, Opening, Application
middleware/auth.js     requireLogin / requireRole guards
routes/                auth, clubs, openings, applications (REST API)
public/                frontend: index.html, student.html, admin.html, css/, js/
docs/                  requirements + wireframes, API + DB design, Postman collection
scripts/               setup check + end-to-end API smoke test
```

## Docs
- [User stories and wireframes](docs/requirements.md)
- [Database design and REST endpoints](docs/api.md)
- Postman: import `docs/ClubHire.postman_collection.json`

## Git workflow
Each feature was built on its own branch and merged into `main` with a pull request:
`feature/auth`, `feature/openings`, `feature/applications`, `feature/frontend`.
