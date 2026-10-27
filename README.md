# ClubHire: RVCE Club Recruitment Portal

A full-stack web app where RVCE clubs post recruitment openings and students apply and track their application from **Applied → Shortlisted → Interview → Selected**.

**Stack:** HTML, CSS, JavaScript (frontend) · Node.js + Express (backend) · MongoDB + Mongoose (database) · express-session + bcryptjs (login)

## Features
- **Students:** sign up, log in, browse and search openings, apply with a message, track each application on a progress stepper and timeline, withdraw before shortlisting.
- **Club admins:** create, edit, close/reopen and delete openings (full CRUD); view applicants; move them to the next stage with a note the student can see; reject.
- **Role-based access:** students and admins see different pages and APIs. Admins can only touch their own club's data. Admin accounts can't be self-registered.
- **Validation on both sides:** form checks in the browser, and the same checks again on the server, with clear error messages.

## Getting started (step by step)

Follow these in order the first time. After that you only need step 5.

### 1. Install the tools (one time)
| Tool | Why | Get it |
|---|---|---|
| **Git** | to download the code and push your work | https://git-scm.com/downloads (keep the default options) |
| **Node.js 18 or newer (LTS)** | runs the backend; includes `npm` | https://nodejs.org (pick the **LTS** button) |
| **MongoDB Community Server** | the database | https://www.mongodb.com/try/download/community |
| MongoDB Compass (optional) | to look inside the database | ticked by default in the MongoDB installer |

When installing MongoDB, keep **"Install MongoD as a Service"** ticked. Then it starts by itself every time Windows starts, and you never have to run it manually.

Check that everything is installed. Open a **new** terminal (Command Prompt or PowerShell) and run:
```
git --version
node -v
npm -v
```
Each one should print a version number. If you get *"not recognized"*, close the terminal, open a new one and try again. If it still fails, reinstall that tool.

### 2. Get the code
```
cd C:\
git clone https://github.com/Kushal-MR/clubhire.git
cd clubhire
```
`git clone` downloads the whole project into a new `C:\clubhire` folder. Avoid keeping the project inside a Google Drive or OneDrive folder: syncing `node_modules` breaks things.

### 3. Set up (one time)
**Windows, easiest:** open the `clubhire` folder in File Explorer and double-click **`setup.bat`**. It does the three things below and writes a log to `setup-log.txt`.

**Or by hand (any OS):**
```
npm install
copy .env.example .env
npm run seed
```
- `npm install` downloads the libraries listed in `package.json` into `node_modules/`. It isn't in Git because it's big and can always be rebuilt.
- `.env` holds local settings (port, database address, session secret). Each person makes their own copy from `.env.example`. On Mac/Linux use `cp` instead of `copy`.
- `npm run seed` **wipes and refills** your local database with demo clubs, accounts and openings. Run it any time you want a fresh start.

### 4. Check the database is running
Double-click `scripts\check-setup.bat`, then open `setup-check.txt` (it appears in the main `clubhire` folder). You want `STATE : 4 RUNNING` under the MongoDB service and `True` under port 27017.
If MongoDB isn't running: press Win+R, type `services.msc`, find **MongoDB Server**, then right-click → **Start**.

### 5. Run the app (every time)
Double-click **`start.bat`**, or run `npm start`. Then open **http://localhost:5050**.
Keep the server window open while you use the app. Closing it (or Ctrl+C) stops the server.

Demo logins (password for all: `password123`):
| Role | Email |
|---|---|
| Student | student@rvce.edu.in |
| Admin (Coding Club) | coding@rvce.edu.in |
| Admin (Rotaract) | rotaract@rvce.edu.in |

New students can also sign up from the home page. Admin accounts can only be created in `seed.js`, on purpose.

### 6. Test the API (optional)
With the server running, double-click `scripts\run-smoke-test.bat`. It runs 28 end-to-end checks (login, CRUD, validation, role and club permissions, status rules), shows the results, then resets the demo data. Results are also saved to `smoke-test-log.txt`.
You can also import `docs/ClubHire.postman_collection.json` into Postman.

### Troubleshooting
| Problem | Fix |
|---|---|
| `Could not connect to MongoDB. Is it running?` | MongoDB service is stopped. See step 4. |
| `Port 5050 is already used by another app` | Change `PORT=5050` in your `.env` to another number (e.g. 5051) and open that port in the browser instead. |
| `'node' / 'npm' / 'git' is not recognized` | Tool not installed, or the terminal was opened before installing. Open a new terminal. |
| `npm` errors in PowerShell about "running scripts is disabled" | Use Command Prompt instead, or double-click the `.bat` files. |
| `Cannot find module 'express'` (or similar) | You skipped `npm install`. Run it in the `clubhire` folder. |
| Page loads but shows no openings | Run `npm run seed` to fill the database. |
| Login stops working after re-seeding | Seeding recreates the accounts. Log out (or clear cookies for localhost) and log in again. |

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

## Working together (Git workflow)
`main` always holds working code. Nobody commits to `main` directly: each change goes on its own branch and comes in through a pull request (PR).

**Before starting any new work, get the latest code:**
```
git switch main
git pull
```

**Make a branch for your feature** (name it after what you're doing):
```
git switch -c feature/real-club-data
```

**Work, then save your changes in small commits:**
```
git status
git add <the files you changed>
git commit -m "Add real club list and recruitment schedule to seed data"
```

**Upload the branch and open a PR:**
```
git push -u origin feature/real-club-data
```
On GitHub, click **Compare & pull request**, describe what you changed, and ask a teammate to review it. After it's approved, click **Merge**. Then everyone runs `git switch main` and `git pull` to get it.

If you changed `seed.js`, run `npm run seed` after pulling, so your local database matches.

**Merge conflict?** Git marks the clashing lines with `<<<<<<<`, `=======` and `>>>>>>>`. Keep the correct lines, delete the markers, then `git add` the file and `git commit`.
