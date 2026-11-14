# Support Task Management API

A production-ready RESTful backend built with **Node.js**, **Express 5**, **TypeScript**, and **PostgreSQL**. 

This capstone project is built to demonstrate industry-standard backend architecture and clean software design patterns without relying on heavy ORMs, focusing on raw SQL optimization, robust type safety, and clean separation of concerns.

---

## 🌟 Key Features

- **Layered Clean Architecture**: Strict separation across Controller/Route, Service (business rules), and Repository (database access) layers.
- **ORM-Free PostgreSQL**: Direct connection pooling using `pg` with parameterized SQL queries, custom migrations, and transactional execution.
- **Robust Authentication & RBAC**: Stateless JWT authentication with Bearer tokens, password hashing with `bcrypt`, and Role-Based Access Control (`USER`, `ADMIN`).
- **Strict Type Safety**: Maximum TypeScript compiler strictness (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`).
- **Centralized Error Handling**: Custom `AppError` class with HTTP status codes and unified Express error-handling middleware.
- **Custom SQL Migration Runner**: Database schema migrations executed sequentially within database transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- **Containerized Database**: Docker Compose setup for consistent and reproducible local PostgreSQL instances.
- **Structured Logging**: High-performance JSON logging using `pino` and pretty printing in development with `pino-pretty`.

---

## 🏗️ Architecture & Design Patterns

The project follows the **Three-Layer Architecture** pattern to guarantee maintainability and testability:

```text
HTTP Request
     │
     ▼
┌────────────────────────┐
│  Routes / Middlewares  │  <-- Auth, RBAC, Request Parsing
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│     Service Layer      │  <-- Business Logic, Input Validation, Rules
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│    Repository Layer    │  <-- Parameterized SQL Queries via pg pool
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   PostgreSQL Database  │  <-- Tables, Constraints, Indexes
└────────────────────────┘
```

### Why Raw SQL instead of an ORM?
- **Full control** over query performance, indexing, and execution plans.
- **Deep understanding** of relational database principles, transactions, and foreign keys.
- **Zero ORM abstraction overhead** while preserving security through parameterized queries (`$1, $2`) that prevent SQL Injection.

---

## 📁 Project Structure

```text
campstone_project/
├── migrations/                # Sequential SQL schema migrations
│   ├── 001_enable_pgcrypto.sql
│   ├── 002_create_users_table.sql
│   ├── 003_create_support_tasks_table.sql
│   └── 004_create_banners_table.sql
├── src/
│   ├── config/                # Environment variables & runtime validation
│   ├── constants/             # Centralized strings, status enums & constraints
│   ├── errors/                # Custom AppError with status codes
│   ├── lib/                   # Database pool, JWT helpers, Pino logger
│   ├── middleware/            # Auth, Admin RBAC, 404, & global error handlers
│   ├── repositories/          # Database queries (Repository pattern)
│   ├── routes/                # Express routes & endpoint mappings
│   ├── scripts/               # Transactional migration engine
│   ├── services/              # Core business rules & validation logic
│   ├── types/                 # TypeScript interfaces, types & ambient declarations
│   ├── app.ts                 # Express app initialization
│   └── server.ts              # HTTP server bootstrap & lifecycle
├── docker-compose.yml         # Local PostgreSQL Docker configuration
├── tsconfig.json              # Strict TypeScript engine configuration
├── package.json
└── README.md
```

---

## 🗄️ Database Schema & Entities

The application utilizes PostgreSQL with UUID primary keys generated via `gen_random_uuid()`:

### Tables
1. **`users`**
   - `id`: `UUID PRIMARY KEY`
   - `email`: `VARCHAR(255) NOT NULL UNIQUE`
   - `password_hash`: `TEXT`
   - `google_id`: `VARCHAR(255) UNIQUE`
   - `role`: `VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))`
   - `created_at` / `updated_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

2. **`support_tasks`**
   - `id`: `UUID PRIMARY KEY`
   - `title`: `VARCHAR(150) NOT NULL`
   - `status`: `VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))`
   - `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `created_at` / `updated_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

3. **`migrations`**
   - `id`: `SERIAL PRIMARY KEY`
   - `name`: `VARCHAR(255) NOT NULL UNIQUE`
   - `executed_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

---

## 🚀 API Endpoints

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and uptime check |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT access token |
| `GET` | `/api/auth/me` | User / Admin | Retrieve current authenticated user profile |

### User Support Tasks (`/api/task`)
All endpoints in this group require a valid Bearer Token (`Authorization: Bearer <token>`).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/task` | User | Create a new support task |
| `GET` | `/api/task` | User | Fetch all support tasks created by authenticated user |
| `GET` | `/api/task/:taskId` | User | Fetch a specific task by UUID |
| `PATCH` | `/api/task/:taskId` | User | Update task title |
| `DELETE` | `/api/task/:taskId` | User | Delete a task owned by authenticated user |

### Admin Task Management (`/api/admin/task`)
Requires a valid Bearer Token from an account with `ADMIN` role.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/task` | Admin | List all tasks across users (supports `?search=` and `?status=`) |
| `PATCH` | `/api/admin/task/:taskId/status` | Admin | Update status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) |

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd campstone_project
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `.env` contains valid configuration:
```env
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

DATABASE_URL=postgresql://postgres:postgres@localhost:5440/nodejs-capstone?sslmode=disable
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ACCESS_EXPIRES_IN=1d
```

### 3. Start PostgreSQL Database
Start the containerized PostgreSQL instance using Docker Compose:
```bash
npm run docker:up
```

### 4. Run Database Migrations
Run the transactional migration runner to initialize the database tables:
```bash
npm run migrate
```

### 5. Start the Application
Run in development mode with hot-reloading (via `tsx watch`):
```bash
npm run dev
```

The API will be available at `http://localhost:4000/api`.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts server in watch mode using `tsx` |
| `npm run build` | Compiles TypeScript into JavaScript (`dist/`) |
| `npm start` | Runs the compiled production code (`dist/server.js`) |
| `npm run migrate` | Executes pending SQL migrations in `migrations/` |
| `npm run docker:up` | Starts PostgreSQL container in background |
| `npm run docker:down` | Stops PostgreSQL container |

---

## 🛡️ Best Practices & Learnings Demonstrated

1. **SQL Injection Prevention**: All queries use positional parameters (`$1, $2`) provided by `node-postgres` rather than string concatenation.
2. **Strict TypeScript Compiler Options**:
   - `noUncheckedIndexedAccess`: Forces explicit checking when accessing array elements (`arr[1]`), avoiding runtime undefined errors.
   - `exactOptionalPropertyTypes`: Distinguishes between omitted optional fields and fields explicitly assigned `undefined`.
3. **Graceful Error Handling**:
   - Operational errors inherit from `AppError` and carry explicit HTTP status codes (400, 401, 403, 404, 409).
   - Unhandled runtime errors are caught centrally, logged via `pino`, and masked behind generic 500 responses in production to prevent leaking sensitive stack traces.
4. **Database Migration Safety**: Migrations run inside SQL transactions (`BEGIN` ... `COMMIT` / `ROLLBACK`), ensuring that if any migration statement fails, the schema rolls back cleanly.

---

## 📝 License
This project is licensed under the [ISC License](LICENSE).
