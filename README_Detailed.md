# Diyetia – Detailed Walkthrough

This is the long version of [README.md](README.md). It follows **`POST /api/nutrition/assignCustomPlanToClient`** through every layer, then goes through each interview topic with file and line references.

- **Request comes in:** `backend/Controller/nutritionController.js` → `nutritionController.assignCustomPlanToClient(req, res)` (line 101)
- **Response goes out:** `backend/Controller/nutritionController.js` → `res.status(200).json(result)` (line 122), errors in the `catch` block (lines 123–129)

---

## Step by step

### 0. Caller – frontend
`frontend/src/Components/MealPlanEditor/MealPlanEditor.jsx:804` sends the request with axios. The JWT from login goes in the `Authorization` header. When the response is 200, the created assignment is passed to `onSave(response.data)`.

### 1. Entry point and global middleware – `backend/app.js`
Express runs these middleware in order for every request:

| Line | Middleware | What it does |
|---|---|---|
| 47 | `requestContext` (`Middleware/ErrorHandler.js:23`) | Gives every request an id and returns it in the `X-Request-Id` header. For 5xx responses caused by unexpected errors, it replaces the raw error message with a generic one. |
| 48 | `bodyParser.json()` | Parses the JSON body into `req.body`. Broken JSON goes to `errorHandler` and returns 400. |
| 52 | `cors(...)` | The only CORS configuration. |
| 147 | `limiter` | Rate limit: 500 requests per 15 minutes per IP. |
| 160 | `app.use('/api/nutrition', nutritionRoutes)` | Sends every `/api/nutrition/*` request to the nutrition router. |
| 164–165 | `notFound`, `errorHandler` | Handle unknown URLs and any error a handler did not catch. |

### 2. Route – `backend/Routes/nutritionRoutes.js:15`
```js
router.post('/assignCustomPlanToClient', authorize(DIETITIAN), nutritionController.assignCustomPlanToClient);
```
Each route file has three things in one line per endpoint: the URL and HTTP method, who may call it (`authorize(...)` with a role from `Enum/Role.js`), and the controller method that handles it. Only a `DIETITIAN` can call this endpoint. A `CLIENT` token or a missing token gets 401.

### 3. Authentication and authorization – `backend/Middleware/Auth.js:13`
`authorize(...roles)` returns an Express middleware that:
1. Reads the token from the `Authorization` header. Both `Bearer <jwt>` and a bare `<jwt>` are accepted.
2. Checks the signature and expiry with `jwt.verify(token, config.secretkey)` (line 20).
3. Returns 401 `"Yetkisiz erişim."` if the token is invalid, has no `id`, or has a role that is not in `roles` (line 25).
4. Otherwise sets `req.user = {id, role}` (line 32) and calls `next()`. From here on, the code takes the user's id **only from `req.user`**, never from the request body.

### 4. Controller – `backend/Controller/nutritionController.js:101`
The controller is the HTTP layer. It knows about `req` and `res`, but it has no business rules and no queries.
```js
const dietitian_id = req.user.id;                                          // who is calling (from the token)
const {client_id, mealPlan, start_date, end_date, note} = req.body;        // input
if (!client_id || !mealPlan || !start_date || !end_date) → 400              // required fields
const result = await NutritionService.assignCustomPlanToClient(...);       // business logic
res.status(200).json(result);                                               // response out
catch (error) { logError(req, error); res.status(error.status || 500).json({showOnScreen, message}); }
```
The frontend shows `message` in a toast when `showOnScreen` is true.

### 5. Service – `backend/Service/NutritionService.js:135`
The service holds the business rules. It doesn't know about HTTP: it gets plain values and either returns data or throws an `Exception(message, status, showOnScreen)` (`Exception/Exception.js`).
```js
if (!client_id || !mealPlan || !start_date || !end_date) throw new Exception("Eksik parametreler.", 400, true);  // line 136

return await sequelize.transaction(async (transaction) => {                                    // line 140
    const client = await Client.findByPk(client_id, {lock: true, transaction});               // line 144 – SELECT ... FOR UPDATE
    if (!client) throw new Exception("Bu danışan bulunamadı.", 404, true);

    const existingAssignment = await NutritionAssignment.findOne({where: {client_id, [Op.or]: [...overlap...]}, transaction});  // line 150
    if (existingAssignment) throw new Exception("...", 409, true);                            // line 162

    return await NutritionAssignment.create({client_id, mealPlan, start_date, end_date, note}, {transaction});  // line 166
});
```
- **Why a transaction and a row lock:** without them, two requests for the same client could both pass the overlap check at the same moment and both insert. With `lock: true`, the second request waits until the first one commits, so it sees the first plan and gets 409. Requests for different clients don't wait for each other.
- **Commit and rollback:** this is a managed transaction. Sequelize commits when the callback returns and rolls back when anything inside it throws, including our own 404/409 `Exception`s.
- **The overlap rule:** a new plan conflicts if its start date or end date falls inside an existing plan, or if an existing plan fully covers the new range.

### 6. Models and ORM – `backend/Model/`
- **`Model/NutritionAssignment.js:5`** defines the `NutritionAssignments` table with `sequelize.define`: `id`, `client_id` (FK → `Clients.id`), `nutrition_plan_id` (FK → `NutritionPlans.id`, null for custom plans), `mealPlan` (JSON), `note` (TEXT, max 5000), `start_date` / `end_date` (DATEONLY), plus `createdAt` / `updatedAt`. The model also has validators (`notNull`, `isDate`, `isInt`, `len`). If one fails, Sequelize throws a `SequelizeValidationError` before the INSERT runs.
- **`Model/Client.js`** defines the `Clients` table. Each client has a `dietitian_id`.
- **`Model/MainModel.js`** loads all the models, sets up the associations in one place (e.g. `Client.hasMany(NutritionAssignment, {foreignKey: 'client_id', onDelete: 'CASCADE'})` and `NutritionAssignment.belongsTo(Client)`, lines 100–106), and exports the models together with the shared `sequelize` instance. Services import everything from here, so the associations are always registered.
- **SQL:** Sequelize builds the SQL from the objects we pass in, and the values are sent as bound parameters, never concatenated into the SQL string. The three calls above run roughly:
  ```sql
  BEGIN;
  SELECT ... FROM "Clients" WHERE "id" = $1 FOR UPDATE;
  SELECT ... FROM "NutritionAssignments" WHERE "client_id" = $1 AND (("start_date" BETWEEN $2 AND $3) OR ...) LIMIT 1;
  INSERT INTO "NutritionAssignments" (...) VALUES ($1, $2, ...) RETURNING *;
  COMMIT;   -- or ROLLBACK if anything threw
  ```
- **Schema:** for now, tables are created from the models with `sequelize.sync()` on startup. The `DDL` env var chooses `update` or `create-drop` (`app.js`, `start()`).

### 7. Database connection – `backend/Utils/Database.js:5`
There is one `new Sequelize(database, user, password, {host, dialect: 'postgres'})` instance for the whole app. Its values come from `Utils/Config.js`, which reads them from environment variables (see "Database credentials" below).

### 8. Response
- **200:** the new `NutritionAssignment` row as JSON (`id`, `client_id`, `mealPlan`, dates, `note`, timestamps).
- **400:** a required field is missing. **401:** no token, a bad token, or the wrong role. **404:** client not found. **409:** the dates overlap another plan.
- **500:** unexpected error. The error is logged with its stack, and the user gets `"Bir hata oluştu."` and a `requestId`.

The second flow worth looking at is **login** (`POST /api/dietitian/login`), because it shows password checking and token creation:
`backend/Routes/dietitianRoutes.js:9` → `backend/Controller/dietitianController.js:8` → `backend/Service/DietitianService.js:27` → response at `backend/Controller/dietitianController.js:21`.


---

## Notes per interview topic

### 1. Error handling
- **Controller:** each handler has a `try/catch`. In the catch it logs with `logError(req, error)` and sends back `{showOnScreen, message}` with `error.status || 500`.
- **Service:** errors we expect are thrown as `new Exception(msg, status, showOnScreen)` (`backend/Exception/Exception.js`), e.g. 404 when the client is not found, 409 when the dates overlap. If something throws inside `sequelize.transaction(...)`, the transaction is rolled back automatically.
- **Unexpected errors** (DB down, bugs): `requestContext` (`ErrorHandler.js:23`) wraps `res.json`. For a 5xx caused by a plain `Error` (not our `Exception`), the user gets `"Bir hata oluştu."` plus a `requestId` instead of the raw DB message. Support can then look up that id in the logs.
- **Last resort:** `errorHandler` (`ErrorHandler.js:52`) handles everything the controllers don't catch: broken JSON (→ 400), Multer errors (→ 400) and unknown routes (`notFound` → 404). `unhandledRejection` and `uncaughtException` are logged in `app.js:167`.

### 2. Error logging
- **Where:** `backend/Utils/Logger.js`. pino writes structured JSON to stdout (pretty-printed in development). In production, stdout is meant to be collected by the platform (container logs / CloudWatch).
- **What is written:** request id, method, path without the query string, user id, role, and the error's name/message/status/code. Stack traces are only kept for 5xx; 4xx are logged as `warn` without a stack (`logError`, line 132).
- **What is kept out:**
  - Request body, query string and headers are never logged (`requestInfo`, line 115).
  - `serializeError` (line 88) only copies fields from an allowlist, so Sequelize's `sql` and `parameters` (which contain user data) are dropped.
  - Keys like `password`, `token`, `authorization`, `email`, `phoneNumber`, health notes, … are replaced with `[REDACTED]` by pino `redact` (line 49) and `sanitize()`.
  - Error messages and stacks are scrubbed with regex for emails, phone numbers, Bearer tokens and JWTs (`SCRUB_PATTERNS`, line 27).
  - Sequelize SQL logging is turned off (`config.json → database_options.logging: false`).

### 3. Clean code
The layers are clearly split, the infrastructure code has JSDoc, and the comments explain *why* (e.g. the row-lock comment in `NutritionService.js:141`). What I would clean up is listed in [README.md → Known weak spots](README.md#known-weak-spots-and-what-i-would-change).

### 4. Database credentials
- They come only from **environment variables**: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (`backend/Utils/Config.js:35`). Locally they are loaded from `backend/.env` with dotenv. `.env` is in `.gitignore`; `backend/.env.example` lists the keys with no values.
- `required()` (`Config.js:12`) throws on startup if a key is missing, so the app fails fast instead of half-working.
- `config.json` only has non-secret settings (URLs, version, S3 region/bucket name). The resulting `config` object is frozen.
- `Utils/Database.js:5` builds the Sequelize instance from `config.database_connection`. No credentials are in the code.
- In production I would inject them from a secrets store (AWS Secrets Manager / SSM Parameter Store, or the hosting platform's secret env vars) instead of a `.env` file on the server.

### 5. Login and permissions
- **Hashing:** `bcrypt.hash(password, 10)` on register (`DietitianService.js:88`, and the same in `ClientService.js`).
- **Compare:** `bcrypt.compare(password, dietitianInfo.password)` on login (`DietitianService.js:35`). A wrong phone number and a wrong password give the same message ("Hatalı giriş bilgileri."), so the API does not reveal which accounts exist.
- **Token:** after a successful compare, `jwt.sign({id, phoneNumber, role}, JWT_SECRET, {expiresIn: '30d'})` (`DietitianService.js:39`).
- **Who the user is on each request:** `authorize()` (`Middleware/Auth.js:13`) checks the token with `jwt.verify` and sets `req.user = {id, role}`. Controllers always take the user id from `req.user.id`.
- **What they are allowed to do:** (a) a role check per route: `authorize(DIETITIAN)` / `authorize(CLIENT)` / `authorize()` for any logged-in user; (b) ownership checks in the services, by adding `dietitian_id` to the `where` (e.g. `NutritionService.assignNutritionPlanToClient` checks that both the client and the plan belong to this dietitian).

### 6. Object-oriented design
- Controllers and services are classes with static methods. There is one service per domain (Nutrition, Client, Dietitian, …). Models are Sequelize models, and `Exception` extends `Error`.
- Shared concerns live in one place each, so they are not repeated: auth (`authorize` middleware), config, the DB instance, the models and their associations (`MainModel`), the logger, and error masking (`requestContext`).
- There is still duplication: the error response block in each controller catch (see [Known weak spots](README.md#known-weak-spots-and-what-i-would-change)) and the date-overlap query, which appears twice in `NutritionService`. Static classes also make dependency injection harder, so the tests mock modules with `jest.mock` instead of passing in fakes.

### 7. Authentication and authorization – endpoints
All endpoints are under `/api/<domain>/…`; see `backend/Routes/*.js`. Each route shows how it is protected in the route file itself:

| Protection | Examples |
|---|---|
| Public | `POST /api/dietitian/login`, `POST /api/dietitian/register`, `POST /api/client/login`, `POST /api/dietitian/verifyEmail`, `GET /api/version` |
| Any logged-in user | `POST /api/upload` (`authorize()`) |
| `DIETITIAN` only | almost all of `/api/nutrition/*`, `/api/dietitian/*` (client management, notes, settings) |
| `CLIENT` only | the client's own endpoints, e.g. `DELETE /api/nutrition/deleteClientWater` |

### 8. Database access
- **Sequelize ORM**. I don't write SQL by hand. Queries are built from objects (`where: {id, dietitian_id}`, `Op.between`, …), and Sequelize sends the values as bound parameters, so user input is never concatenated into SQL.
- **Transactions:** managed transactions with `sequelize.transaction(async (transaction) => …)` and row locks where there is a race condition. The request above is the example. The seeder also runs everything in one transaction, so a failed seed writes nothing.
- Covered by `backend/Tests/unit/transactions.test.js`: it checks that the lock is taken and that the same transaction is used for the check and the insert.

### 9. General good practice
- **Tests:** `cd backend && npm test`. 38 tests in 7 suites, all passing. Unit tests cover the `Auth` middleware, the login services, `Exception` and transactions. Integration tests run Supertest against the Express app with mocked models (login → token → protected endpoint, 401/404, broken JSON). There is also a login regression test.
- **Input validation:** right now it is manual (required fields in the controller, a few rules in the service) plus Sequelize model validators. I would replace it with a schema (zod/Joi) per endpoint: types, date format, `end_date >= start_date`, max lengths, and the shape of `mealPlan`.
- **Dependencies:** `package-lock.json` is committed and dependencies are updated by hand with `npm outdated` and `npm audit` (the last update was a separate "Backend Package Update" commit, plus an `overrides` entry for `uuid`). Next step: Dependabot/Renovate plus `npm audit` in CI.
- **Review and deploy (what I would set up):** PR → CI (lint, tests, `npm audit`, secret scanning) → review → merge → build an image → deploy to staging with migrations → smoke test → production. Secrets would come from the platform's secret store. I would also switch from `sequelize.sync()` (the `DDL` env var) to versioned migrations.

