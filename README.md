# Diyetia – Dietitian / Client Management Platform

A personal project: dietitians manage their clients, meal plans, recipes, exercises, appointments and invoices; clients follow their plans from the web and mobile apps.

| Folder | Stack |
|---|---|
| `backend/` | Node.js, Express 5, Sequelize 6 (PostgreSQL), JWT, bcryptjs, pino, Jest + Supertest |
| `frontend/` | React (Vite) – dietitian web panel |
| `mobile/` | React Native – client app |

**For the interview, please focus on `backend/`.** The frontend and mobile apps are only the callers.

### Links
- **GitHub repository:** https://github.com/furkanimamoglu/dietitian
- **iOS app (App Store):** https://apps.apple.com/tr/app/diyetia/id6748645561?l=tr
- **Instagram:** https://www.instagram.com/diyetia.app

---

## The request to follow

**`POST /api/nutrition/assignCustomPlanToClient`** – a logged-in dietitian assigns a custom meal plan to one of their clients for a date range.

### Where the request comes in
- **File:** [`backend/Controller/nutritionController.js`](backend/Controller/nutritionController.js)
- **Function:** `nutritionController.assignCustomPlanToClient(req, res)` (line 101)

### Where the response goes out
- **File:** [`backend/Controller/nutritionController.js`](backend/Controller/nutritionController.js)
  - Success: `res.status(200).json(result)` (line 122)
  - Error: the `catch` block right below it (lines 123–129)

### Overview

```
Frontend (MealPlanEditor.jsx)
   │  POST /api/nutrition/assignCustomPlanToClient   Authorization: <jwt>   body: {client_id, mealPlan, start_date, end_date, note}
   ▼
app.js ─ global middleware: requestContext → bodyParser.json → cors → rateLimit
   ▼
Routes/nutritionRoutes.js ─ URL + method → authorize(DIETITIAN) → controller
   ▼
Middleware/Auth.js ─ jwt.verify → req.user = {id, role}  (401 if invalid / wrong role)
   ▼
Controller/nutritionController.js ─ reads req.user + req.body, checks required fields, calls the service, sends the response
   ▼
Service/NutritionService.js ─ business rules inside one DB transaction
   ▼
Model/NutritionAssignment.js, Model/Client.js (registered in Model/MainModel.js) ─ Sequelize models
   ▼
Utils/Database.js ─ one Sequelize instance → PostgreSQL
```

On the way back, the service returns the created row to the controller, and the controller turns it into the HTTP response. If anything throws, the error goes back up the same path to the controller's `catch`.

For the full step-by-step walkthrough (every layer with file and line numbers, the generated SQL, transaction and locking details, and the response codes), see **[README_Detailed.md](README_Detailed.md)**.

The second flow worth looking at is **login** (`POST /api/dietitian/login`), because it shows password checking and token creation:
`backend/Routes/dietitianRoutes.js:9` → `backend/Controller/dietitianController.js:8` → `backend/Service/DietitianService.js:27` → response at `backend/Controller/dietitianController.js:21`.

---

## Layers

```
Routes/        URL + HTTP method + which roles may call it (authorize middleware)
Controller/    Reads req, checks the input, calls the service, writes the HTTP response
Service/       Business rules, ownership checks, transactions; throws Exception(message, status, showOnScreen)
Model/         Sequelize models; MainModel.js defines the associations and exports everything
Middleware/    Auth.js (authentication/authorization), ErrorHandler.js (request id, 404, last-resort error handler)
Utils/         Config (env + config.json), Database (Sequelize instance), Logger (pino + redaction), Mailer
Exception/     Exception class for errors we throw on purpose (status + a message that is safe to show)
Enum/          Role (DIETITIAN, CLIENT)
Seeders/       Demo data for development (see "Running locally")
Tests/         unit / integration / regression (Jest + Supertest, DB is mocked)
```

---

## Interview topics – where to look

Details for each topic are in [README_Detailed.md](README_Detailed.md#notes-per-interview-topic).

| Topic | Main files |
|---|---|
| Error handling | `Controller/*` (try/catch), `Exception/Exception.js`, `Middleware/ErrorHandler.js` |
| Error logging | `Utils/Logger.js` (pino, redaction, allowlist error serializer) |
| Database credentials | `Utils/Config.js` (env vars, `required()`), `.env.example`, `Utils/Database.js` |
| Login and permissions | `Service/DietitianService.js:27` (`bcrypt.compare`, `jwt.sign`), `Middleware/Auth.js` |
| Authentication / authorization | `Routes/*.js` (`authorize(ROLE)` on each route) |
| OOP / layers | `Routes` → `Controller` → `Service` → `Model` |
| Database access | Sequelize ORM, bound parameters, `sequelize.transaction` in `Service/NutritionService.js:140` |
| Tests | `Tests/` (unit, integration, regression) – `cd backend && npm test` |

---

## Known weak spots (and what I would change)

1. **Duplicated error handling in controllers.** Every controller has the same `catch` block that builds the error response, and services throw both plain objects (`throw {status, message}`) and `Exception`. I left this as it is on purpose. Moving to the central mechanism (an `asyncHandler` wrapper or Express 5's async error forwarding, throwing only `Exception`, and letting `errorHandler` build every error response) is one large change across all controllers. I want to do it in one go, instead of updating each custom error one by one now and again later.
2. **`app.js` does too much.** The upload handler (S3 client, validation) should move to its own route/controller/service. S3 objects are uploaded as `public-read`; pre-signed URLs would be better.
3. Some old code is still around: `Utils/Security.js` (replaced by `Middleware/Auth.js`), commented-out e-mail verification code in `register`, and `sequelize.sync()` instead of migrations.

---

## Running locally

### Backend
Requirements: Node.js 20+ and PostgreSQL.

```bash
cd backend
cp .env.example .env      # fill in DB / JWT / mail / S3 values
npm install
npm test                  # tests mock the DB, no Postgres needed
node app.js               # http://localhost:3000
```

- Create an empty database first (e.g. `dietitian_db`). With `DDL=update`, the tables are created from the models on startup and existing data is kept. `DDL=create-drop` drops and recreates all tables.
- `NODE_ENV=development` gives pretty logs.

### Demo data (seeders)
`backend/Seeders/` fills the database with a demo dietitian and their clients, plus anamnesis, measurements, water, appointments, packages, invoices, recipes, exercises, nutrition plans and assignments, messages, notifications and notes.

```bash
npm run seed          # creates the demo data if it does not exist yet
npm run seed:fresh    # deletes only the demo data and creates it again (other users' data is not touched)
```

- **On startup:** with `NODE_ENV=development`, `app.js` runs the seeder automatically when the demo data is missing. `SEED_ON_START=false` turns this off. If the seeder fails, the server still starts.
- **Safety:** the seeder refuses to run when `NODE_ENV=production`.
- **One transaction:** all seeders run in one transaction (`masterSeeder.js`). If one of them fails, nothing is written. They run in a fixed order because later seeders use the records the earlier ones created.
- **Demo logins:** the dietitian and client phone numbers and passwords are defined in `Seeders/DietitianSeeder.js` and `Seeders/ClientSeeder.js`, and printed in the log when seeding finishes. Passwords are stored hashed with bcrypt, like real users.

### Frontend (dietitian web panel)
```bash
cd frontend
npm install
npm run dev           # Vite dev server, http://localhost:5173
```

- The API address is in `frontend/src/config.js`. With `environment: "dev"` it calls `http://localhost:3000/api`, so start the backend first.
- Log in with the demo dietitian account from the seeder. The token is kept in `localStorage` and sent in the `Authorization` header on every request.
- To see the request above: open a client → nutrition → create a custom plan in the meal plan editor and save it.
