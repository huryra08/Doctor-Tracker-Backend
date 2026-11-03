# Doctor Tracker API

## Description

Doctor Tracker is a secure administrative platform for managing doctors and their patients. This repository is the standalone REST API: it handles admin authentication, doctor and patient management with fast search, filtering and pagination, and MongoDB aggregation pipelines that power the analytics dashboard. It is built with Node.js, Express, TypeScript and MongoDB, and is consumed by a separate Next.js client over REST.

**Live API:** https://doctor-tracker-backend-ukvd.onrender.com
**Frontend repo:** YOUR_FRONTEND_REPO_LINK
**Frontend live link:** YOUR_FRONTEND_LIVE_LINK

> The API runs on a free hosting plan that sleeps after 15 minutes of inactivity. The first request can take 30 to 60 seconds.

## Features

- JWT authentication stored in an HTTP-only cookie, with a role check middleware
- Every route except login and logout is protected
- Doctors: create, list, view, update, delete (blocked while the doctor has patients)
- Patients: create, list, view, edit, delete, and nested routes under a doctor
- Search, filters (specialization, hospital, condition, gender, doctor, date range), sorting and pagination on both lists
- Dashboard analytics: totals, patients per doctor, patients by condition and gender, doctors by specialization, daily and monthly statistics
- Request validation with Zod and one central error handler
- Seed script with realistic sample data spread over six months

## Tech Stack

| Area | Choice |
| --- | --- |
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database | MongoDB (Atlas) with Mongoose |
| Auth | JSON Web Tokens, bcrypt |
| Validation | Zod |
| Hosting | Render (API), MongoDB Atlas (database) |

## Setup Guide

### Prerequisites

- Node.js 20 or newer
- A MongoDB database: a free MongoDB Atlas cluster, or a local MongoDB server
- Git

### 1. Clone and install

```bash
git clone https://github.com/huryra08/doctor-tracker-backend.git
cd doctor-tracker-backend
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

On Windows PowerShell use `copy .env.example .env`.

`.env.example`:

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/doctor-tracker?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

| Variable | Meaning |
| --- | --- |
| `NODE_ENV` | `development` or `production`. Production turns on secure cross-site cookies |
| `PORT` | Port the server listens on |
| `DATABASE_URL` | MongoDB connection string, including the database name |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random value |
| `JWT_EXPIRES_IN` | Token lifetime, for example `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost |
| `CLIENT_URL` | Exact frontend origin allowed by CORS, with no trailing slash |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first admin account, created automatically on first start |

### 3. Run the development server

```bash
npm run dev
```

You should see `MongoDB connected`, `Admin user created` (first run only) and `Server running on port 5000`.

### 4. Seed sample data (optional)

```bash
npm run seed
```

This replaces all doctors and patients with 12 doctors and 120 patients created over the last 180 days. It never touches the admin user.

### 5. Production build

```bash
npm run build
npm run start
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start with auto reload using tsx |
| `npm run build` | Compile TypeScript to `dist` |
| `npm run start` | Run the compiled server |
| `npm run seed` | Load sample doctors and patients |

## System Architecture

```
  Next.js client (Vercel)
          |
          |  HTTPS, REST + JSON, cookie sent with credentials
          v
  Express API (Render)
    |-- middleware: CORS, JSON parser, cookie parser
    |-- auth middleware: verify JWT cookie, load user, check role
    |-- validateRequest: Zod schema for body, query and params
    |-- routes -> controllers -> services -> Mongoose models
    |-- global error handler: one JSON error format
          |
          v
  MongoDB Atlas
    users | doctors | patients (indexed)
```

### Request flow

1. The client logs in with `POST /api/v1/auth/login`. The API checks the password hash and sets an HTTP-only cookie holding a signed JWT.
2. For every later request the browser sends the cookie. The auth middleware verifies the token, loads the user and checks the role.
3. The route validates the input with Zod, the controller calls a service, and the service runs the MongoDB query.
4. Controllers answer through one response helper, so every success and every error has the same JSON shape.

### Folder structure

```
src/
  server.ts            starts the server, connects the database
  app.ts               Express app and global middleware
  scripts/seed.ts      sample data
  app/
    config/            environment variables
    lib/               database connection, JWT helpers
    middleware/        auth, validation, error handler, not found
    routes/            mounts every module router
    utils/             AppError, catchAsync, sendResponse, queryBuilder, seedAdmin
    interfaces/        shared types
    module/
      auth/            model, validation, service, controller, route
      doctor/          model, validation, service, controller, route
      patient/         model, validation, service, controller, route
      dashboard/       service, controller, route (aggregations)
```

### Data model

```
users      name, email (unique), password (hashed), role
doctors    name, specialization, hospital, phone, email (unique)
patients   name, age, gender, phone, condition, doctor -> doctors._id
```

One doctor has many patients. A patient stores its doctor's id. All three collections have timestamps.

## API Reference

Base path: `/api/v1`. All routes need the login cookie, except login and logout.

### Auth

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Log in, sets the cookie |
| POST | `/auth/logout` | Clear the cookie |
| GET | `/auth/me` | Current user |

### Doctors

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/doctors` | Create a doctor |
| GET | `/doctors` | List with search, filters, pagination, sort |
| GET | `/doctors/filter-options` | Specializations and hospitals for dropdowns |
| GET | `/doctors/:id` | One doctor |
| PATCH | `/doctors/:id` | Update a doctor |
| DELETE | `/doctors/:id` | Delete a doctor (409 if patients exist) |
| GET | `/doctors/:id/patients` | A doctor's patients |
| POST | `/doctors/:id/patients` | Add a patient under a doctor |
| DELETE | `/doctors/:id/patients/:patientId` | Remove a patient from a doctor |

### Patients

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/patients` | Create a patient (doctor id in body) |
| GET | `/patients` | List with search, filters, pagination, sort |
| GET | `/patients/filter-options` | Conditions for the dropdown |
| GET | `/patients/:id` | One patient |
| PATCH | `/patients/:id` | Edit a patient |
| DELETE | `/patients/:id` | Delete a patient |

### Dashboard

| Method | Path | Use |
| --- | --- | --- |
| GET | `/dashboard/summary` | Stat cards |
| GET | `/dashboard/patients-per-doctor` | Bar chart |
| GET | `/dashboard/patients-by-condition` | Pie chart |
| GET | `/dashboard/patients-by-gender` | Donut chart |
| GET | `/dashboard/doctors-by-specialization` | Bar chart |
| GET | `/dashboard/patients-daily?days=30` | Line chart |
| GET | `/dashboard/monthly-growth?months=6` | Bar or line chart |
| GET | `/dashboard/recent-patients?limit=5` | Recent activity table |

### List query parameters

| Parameter | Used on | Example |
| --- | --- | --- |
| `page`, `limit` | doctors, patients | `?page=2&limit=10` (limit is capped at 100) |
| `search` | doctors, patients | `?search=cardiology` |
| `specialization`, `hospital` | doctors | `?specialization=Cardiology` |
| `condition`, `gender`, `doctor` | patients | `?condition=Asthma&gender=female` |
| `from`, `to` | doctors, patients | `?from=2026-10-01&to=2026-10-31` |
| `sortBy`, `sortOrder` | doctors, patients | `?sortBy=name&sortOrder=asc` |

List responses look like this:

```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 },
  "data": []
}
```

## Technical Decisions

### 1. Why a standalone Express API instead of Next.js API routes

**Decision.** The backend is a separate Express and TypeScript service, and the Next.js app is only the client.

**Why.**

- **Clear boundary.** The API has its own routes, validation and error format. The frontend can change without touching business logic, and the API could serve a mobile app later.
- **A long-lived server fits MongoDB.** Express keeps one pooled database connection open for the life of the process. Serverless functions can open many short-lived connections, which is a known problem with MongoDB.
- **Independent deployment and scaling.** The API deploys on Render and the client on Vercel. Each one is scaled, rolled back and monitored on its own.
- **Modular structure.** Each feature (auth, doctor, patient, dashboard) is a module with its own model, validation, service, controller and route. That keeps files small, makes testing easier, and lets a new feature be added without touching old ones.

**Trade-offs.** Two repositories and two deployments, plus cross-site cookie settings (secure, sameSite none, CORS with credentials). These are handled with environment variables.

### 2. MongoDB indexing and aggregation for search, filters, pagination and the dashboard

**Decision.** Indexes are designed around the exact queries the app runs, and all analytics are computed inside MongoDB with aggregation pipelines, not in application code.

**Indexes.**

- Text index on doctors (`name`, `specialization`, `hospital`) and patients (`name`, `condition`), with weights so a name match ranks above a hospital match. Search does not scan every document.
- Compound indexes such as `{ doctor: 1, createdAt: -1 }`, `{ condition: 1, createdAt: -1 }` and `{ specialization: 1, createdAt: -1 }`. They serve the filter and the newest-first sort in one index scan.
- A `createdAt` index for date ranges, the default sort, and the dashboard date statistics.
- Unique indexes on user and doctor email.

**Query patterns.**

- Pagination uses `skip` and `limit` with the page size capped at 100, and the data query and the count query run in parallel with `Promise.all`.
- List queries use `.lean()` to return plain objects, which is faster and lighter than full Mongoose documents.
- Sorting is limited to an allow-list of indexed fields, so a client cannot trigger a slow unindexed sort.
- Search text is escaped before it is used in a regular expression filter.

**Aggregation.**

- Patients per doctor groups on the indexed `doctor` field, keeps only the top results, and then joins just those doctors with `$lookup`.
- Daily and monthly statistics filter with `$match` on `createdAt` first, group by date, and fill missing days and months with zero in code, so charts never have gaps.
- Totals use `estimatedDocumentCount`, which reads collection metadata and returns instantly.
- Independent queries for the summary cards run in parallel.

**Trade-offs.** MongoDB text search matches whole words, so `cardio` does not match `Cardiology`. If partial matching is needed later, a prefix search or Atlas Search can be added. Skip-based pagination is simple and fine at this scale. For very large collections, cursor-based pagination would be the next step.

## Scalability Notes

- Stateless API: authentication lives in the token, so several instances can run behind a load balancer.
- Indexes match the query patterns, and list endpoints always paginate.
- Aggregations run inside the database, so the API sends only small chart-ready results.
- Next steps for growth: cursor-based pagination, a cache for dashboard results, rate limiting on login, and Atlas Search for partial text matching.

## Security

- Passwords are hashed with bcrypt and never returned in responses.
- The token is stored in an HTTP-only cookie, so page scripts cannot read it. In production the cookie is secure and sameSite none.
- Every route except login and logout requires a valid token and an admin role.
- CORS only allows the configured frontend origin.
- All input is validated with Zod before it reaches a service.
- Secrets live in environment variables, and `.env` is in `.gitignore`.

## Postman Collection

Import `docs/doctor-tracker.postman_collection.json` into Postman to try every endpoint. Log in first so the cookie is saved, then run any other request.

## Visual Evidence

The UI screenshots (desktop and mobile) are in the frontend repository: YOUR_FRONTEND_REPO_LINK

## Submission Links

- Backend repo: https://github.com/huryra08/doctor-tracker-backend
- Backend live API: https://doctor-tracker-backend-ukvd.onrender.com
- Frontend repo: YOUR_FRONTEND_REPO_LINK
- Frontend live: YOUR_FRONTEND_LIVE_LINK
- Admin login for reviewers: YOUR_ADMIN_EMAIL / YOUR_ADMIN_PASSWORD

## Author

S. M. Abu Huryra - [GitHub](https://github.com/huryra08) - [LinkedIn](https://linkedin.com/in/s-m-abu-huryra)
