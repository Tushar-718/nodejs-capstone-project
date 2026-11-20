# Support Task Management API

A production-style RESTful backend built with **Node.js**, **Express 5**, **TypeScript**, **PostgreSQL**, and **Redis**.

This capstone project demonstrates industry-standard backend architecture without a heavy ORM. It focuses on raw SQL, strict type safety, and clean separation of concerns. It also includes real-world integrations: Google OAuth login, Cloudinary image uploads, Redis caching, and BullMQ background jobs.

---

## 🌟 Key Features

- **Layered Clean Architecture**: Strict separation across Route, Service (business rules), and Repository (database access) layers.
- **ORM-Free PostgreSQL**: Connection pooling with `pg`, parameterized SQL queries, and a custom transactional migration runner.
- **Authentication & RBAC**:
  - Email/password signup and login with `bcrypt` password hashing.
  - **Google OAuth 2.0 sign-in** via `google-auth-library`. A Google account is automatically linked to an existing user with the same email.
  - Stateless JWT access tokens (Bearer) and role-based access control (`USER`, `ADMIN`).
- **Image Uploads with Cloudinary**: Admins upload banner images using `multer` (in-memory, image-only, 10 MB limit), and the images are streamed to Cloudinary.
- **Redis Caching**: The banner list is cached in Redis (`ioredis`) with a TTL and invalidated whenever a banner is created or deleted.
- **Background Jobs with BullMQ**: Deleting a banner queues a job that removes the image from Cloudinary in a separate worker process, with retries and exponential backoff.
- **Strict Type Safety**: `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` enabled.
- **Centralized Error Handling**: Custom `AppError` class with HTTP status codes and a unified Express error middleware.
- **Containerized Infrastructure**: Docker Compose runs PostgreSQL and Redis locally.
- **Structured Logging**: JSON logging with `pino` and `pino-pretty` in development.

---

## 🏗️ Architecture

```text
HTTP Request
     │
     ▼
┌────────────────────────┐
│  Routes / Middlewares  │  <-- Auth (JWT), Admin RBAC, Multer upload
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐        ┌──────────────────────────┐
│     Service Layer      │ ─────► │ Redis cache (ioredis)    │
│  Business rules and    │ ─────► │ Cloudinary (image upload)│
│  validation            │ ─────► │ Google OAuth             │
└───────────┬────────────┘ ─────► │ BullMQ queue (Redis)     │
            │                     └────────────┬─────────────┘
            ▼                                  │
┌────────────────────────┐                     ▼
│    Repository Layer    │        ┌──────────────────────────┐
│  Parameterized SQL     │        │  BullMQ Worker process   │
└───────────┬────────────┘        │  deletes Cloudinary image│
            │                     └──────────────────────────┘
            ▼
┌────────────────────────┐
│   PostgreSQL Database  │
└────────────────────────┘
```

### Banner flows

- **Create**: Multer validates the image → upload to Cloudinary → save `image_url` and `cloudinary_public_id` in PostgreSQL → clear the Redis cache.
- **List**: Read from Redis (cache hit) → otherwise query PostgreSQL and cache the result for 60 seconds.
- **Delete**: Delete the row in PostgreSQL → clear the Redis cache → queue a BullMQ job. The worker deletes the image from Cloudinary (3 attempts, exponential backoff), so the API response does not wait on Cloudinary.

### Why raw SQL instead of an ORM?
- **Full control** over query performance, indexing, and execution plans.
- **Deeper understanding** of relational principles, transactions, and foreign keys.
- **No ORM overhead**, while parameterized queries (`$1, $2`) still prevent SQL injection.

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
│   ├── config/                # Environment variables and validation
│   ├── constants/             # Strings, validation rules, cache keys
│   ├── errors/                # Custom AppError with status codes
│   ├── lib/                   # DB pool, JWT, logger, Redis, banner cache, Cloudinary, Google OAuth
│   ├── middleware/            # Auth, admin RBAC, Multer upload, 404, error handler
│   ├── queues/                # BullMQ queue producers
│   ├── repositories/          # Database queries (Repository pattern)
│   ├── routes/                # Express routes
│   ├── scripts/               # Transactional migration runner
│   ├── services/              # Business rules and validation
│   ├── types/                 # TypeScript types and ambient declarations
│   ├── workers/               # BullMQ workers (run as a separate process)
│   ├── app.ts                 # Express app setup
│   └── server.ts              # HTTP server bootstrap
├── docker-compose.yml         # PostgreSQL + Redis
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

All tables use UUID primary keys generated with `gen_random_uuid()` (`pgcrypto`).

1. **`users`**
   - `id`: `UUID PRIMARY KEY`
   - `email`: `VARCHAR(255) NOT NULL UNIQUE`
   - `password_hash`: `TEXT` (nullable for Google-only accounts)
   - `google_id`: `VARCHAR(255) UNIQUE`
   - `role`: `VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN'))`
   - `created_at` / `updated_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

2. **`support_tasks`**
   - `id`: `UUID PRIMARY KEY`
   - `title`: `VARCHAR(150) NOT NULL`
   - `status`: `VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))`
   - `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
   - `created_at` / `updated_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

3. **`banners`**
   - `id`: `UUID PRIMARY KEY`
   - `image_url`: `TEXT NOT NULL` (Cloudinary secure URL)
   - `cloudinary_public_id`: `TEXT NOT NULL`
   - `created_at` / `updated_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

4. **`migrations`** (created by the migration runner)
   - `id`: `SERIAL PRIMARY KEY`
   - `name`: `VARCHAR(255) NOT NULL UNIQUE`
   - `executed_at`: `TIMESTAMP NOT NULL DEFAULT NOW()`

---

## 🚀 API Endpoints

Base URL: `http://localhost:4000/api`

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Check that the API is running |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register with email and password |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT access token |
| `GET` | `/api/auth/google` | Public | Redirect to the Google sign-in page |
| `GET` | `/api/auth/google/callback` | Public | Google OAuth callback; returns a JWT access token |
| `GET` | `/api/auth/me` | User / Admin | Get the current authenticated user |

### User Support Tasks (`/api/task`)
Requires `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/task` | User | Create a support task |
| `GET` | `/api/task` | User | List the authenticated user's tasks |
| `GET` | `/api/task/:taskId` | User | Get a task by UUID |
| `PATCH` | `/api/task/:taskId` | User | Update a task's title |
| `DELETE` | `/api/task/:taskId` | User | Delete a task you own |

### Admin Task Management (`/api/admin/task`)
Requires a Bearer token for an `ADMIN` account.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/task` | Admin | List all tasks across users (supports `?search=` and `?status=`) |
| `PATCH` | `/api/admin/task/:taskId/status` | Admin | Update status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) |

### Admin Banner Management (`/api/admin/banners`)
Requires a Bearer token for an `ADMIN` account.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/banners` | Admin | Upload a banner image (`multipart/form-data`, field name `image`, images only, max 10 MB) |
| `GET` | `/api/admin/banners` | Admin | List banners (served from the Redis cache when available) |
| `DELETE` | `/api/admin/banners/:bannerId` | Admin | Delete a banner; the Cloudinary image is removed by a background job |

---

## 💻 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher, and npm
- [Docker](https://www.docker.com/) and Docker Compose
- A [Cloudinary](https://cloudinary.com/) account (for banner uploads)
- A Google Cloud OAuth 2.0 Client ID (for Google sign-in)

### 1. Clone and install
```bash
git clone <repository-url>
cd campstone_project
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
All of the following variables are required. The app will not start if any of them is missing.

```env
# Application
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

# PostgreSQL (docker-compose maps 5440 -> 5432)
DATABASE_URL=postgresql://postgres:postgres@localhost:5440/nodejs-capstone?sslmode=disable

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ACCESS_EXPIRES_IN=1d

# Redis (docker-compose maps 6385 -> 6379)
REDIS_URL=redis://localhost:6385

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

> In the Google Cloud Console, add `GOOGLE_CALLBACK_URL` as an **Authorized redirect URI** for your OAuth client.

### 3. Start PostgreSQL and Redis
```bash
npm run docker:up
```

### 4. Run database migrations
```bash
npm run migrate
```

### 5. Start the API
```bash
npm run dev
```

### 6. Start the background worker (separate terminal)
The worker processes Cloudinary image deletions queued by the API.
```bash
npm run worker
```

The API is available at `http://localhost:4000/api`.

### Creating an admin user
New accounts get the `USER` role. To promote one, update it directly in PostgreSQL:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the API in watch mode with `tsx` |
| `npm run worker` | Start the BullMQ worker that deletes Cloudinary images |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/server.js`) |
| `npm run migrate` | Run pending SQL migrations in `migrations/` |
| `npm run docker:up` | Start the PostgreSQL and Redis containers |
| `npm run docker:down` | Stop the containers |

---

## 🧰 Tech Stack

| Area | Tools |
| :--- | :--- |
| Runtime and framework | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 16, `pg` |
| Caching and queues | Redis 7, `ioredis`, BullMQ |
| Authentication | JWT (`jsonwebtoken`), `bcrypt`, Google OAuth (`google-auth-library`) |
| File uploads | `multer`, Cloudinary |
| Logging | `pino`, `pino-pretty` |
| DevOps | Docker Compose |

---

## 🛡️ Best Practices Demonstrated

1. **SQL injection prevention**: Every query uses positional parameters (`$1, $2`) instead of string concatenation.
2. **Strict TypeScript**: `noUncheckedIndexedAccess` forces checks on indexed access, and `exactOptionalPropertyTypes` separates omitted fields from fields set to `undefined`.
3. **Error handling**: Operational errors extend `AppError` with explicit status codes (400, 401, 403, 404, 409). Unexpected errors are logged with `pino` and returned as a generic 500 in production.
4. **Migration safety**: Each migration runs inside a transaction (`BEGIN` / `COMMIT` / `ROLLBACK`), so a failed migration leaves the schema unchanged.
5. **Cache invalidation**: Writes to banners clear the Redis cache, so reads never serve stale data for longer than the TTL.
6. **Async offloading**: Slow third-party cleanup (Cloudinary deletes) runs in a BullMQ worker with retries, keeping API responses fast.
7. **Fail-fast config**: Required environment variables are checked at startup.

---

## 📝 License
This project is licensed under the ISC License.
