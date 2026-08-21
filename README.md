# TaskNest

## Overview

TaskNest is a full-stack Kanban task management system. Guests can create private workspaces, manage boards/columns/tasks/subtasks, drag-and-drop cards with persisted ordering, and switch between light and dark themes.

## Features

- Guest login with JWT session persistence
- Per-guest data isolation (boards are never shared across guests)
- Board create / edit / delete
- Column management
- Task create / edit / delete with subtasks
- Drag-and-drop across columns and within-column reorder (persisted `position`)
- Light / dark theme with persistence and FOUC prevention
- Responsive layout (mobile drawer sidebar, tablet, desktop)
- NestJS API with DTO validation, ownership checks, and production CORS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, React, Tailwind CSS v4, TypeScript |
| Backend | NestJS, class-validator, JWT guest sessions |
| Database | SQLite via Prisma ORM v6 (PostgreSQL-ready) |
| Auth | Lightweight guest JWT (`Authorization: Bearer`) |

## Architecture

```
GuestUser
  └── Board
        └── Column
              └── Task (position)
                    └── Subtask
```

- Frontend talks to the API through a centralized client (`frontend/src/utils/api.ts`).
- Protected routes require a guest JWT created by `POST /api/auth/guest`.
- Controllers stay thin; ownership and reorder logic live in services.

## Project Structure

```
TaskNest/
├── backend/                 # NestJS API
│   ├── prisma/              # Schema, migrations, seed
│   ├── src/
│   │   ├── auth/            # Guest JWT session
│   │   ├── boards/
│   │   ├── tasks/
│   │   └── main.ts
│   └── .env.example
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/api.ts
│   └── .env.example
├── PART2_Product_Understanding.docx
└── README.md
```

## Authentication / Guest Session

1. User enters a guest name on the login screen.
2. Frontend calls `POST /api/auth/guest` with `{ name }`.
3. Backend creates a `GuestUser`, seeds a starter board for that guest, and returns a JWT.
4. Frontend stores `tasknest_guest_token` + guest profile in `localStorage`.
5. All subsequent API calls send `Authorization: Bearer <token>`.
6. Board/task queries are scoped to `guestUserId` from the token.
7. Refresh restores the session via `GET /api/auth/me`.

No password or email registration is required.

## Theme System

- Themes: light and dark
- Persisted in `localStorage` (`tasknest_theme`)
- Applied before paint with an inline script in `layout.tsx` to reduce flash
- Centralized CSS tokens in `globals.css` (`@theme` + `.dark` variant)

## Database Schema

Models: `GuestUser`, `Board`, `Column`, `Task`, `Subtask`

- Foreign keys with cascading deletes
- `Task.position` for ordering
- Indexes on ownership and column/position lookups

SQLite is used for simple local/deployed demos. Switching to PostgreSQL only requires changing `provider` + `DATABASE_URL` and running migrations.

## API Documentation

All board/task routes require `Authorization: Bearer <token>` unless noted.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/guest` | Create guest session (public) |
| GET | `/api/auth/me` | Current guest profile |
| GET | `/api/boards` | List boards for current guest |
| GET | `/api/boards/:id` | Get one board (ownership checked) |
| POST | `/api/boards` | Create board |
| PATCH | `/api/boards/:id` | Update board / columns |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task / subtasks |
| PATCH | `/api/tasks/:id/move` | Move/reorder task (`columnId`, `status`, `position`) |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/subtasks/:id` | Toggle subtask completion |

Validation uses `ValidationPipe` with `whitelist`, `transform`, and `forbidNonWhitelisted`.

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

### Prisma setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

Optional seed (clears data; guests get a starter board on login):

```bash
npx prisma db seed
```

### Environment variables

**Backend (`.env`)**

```env
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="change-me-to-a-long-random-string"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

**Frontend (`.env.local`)**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Running the Application

Terminal 1 — API:

```bash
cd backend
npm run start:dev
```

Terminal 2 — UI:

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Deployment

### Frontend (Vercel)

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your live API, e.g. `https://your-api.onrender.com/api`.
4. Deploy.

### Backend (Render / Railway)

1. Create a web service with **Root Directory** `backend`.
2. Build: `npm install && npx prisma generate && npm run build`
3. Start: `npx prisma migrate deploy && node dist/main.js`
4. Set env vars:
   - `DATABASE_URL` (prefer managed PostgreSQL in production)
   - `JWT_SECRET`
   - `FRONTEND_URL` (exact Vercel URL)
   - `PORT` (platform-provided)
   - `NODE_ENV=production`
5. For SQLite on Render, attach a persistent disk and point `DATABASE_URL` at that path.

### Live URLs

Frontend live URL: _[ADD AFTER DEPLOYMENT]_  
Backend live URL: _[ADD AFTER DEPLOYMENT]_

## Part 2 — Product Understanding

The document `PART2_Product_Understanding.docx` is included in the repository and covers product understanding, UX analysis, and improvement recommendations for the assessment Part 2 submission.

## Design Decisions

- **Guest JWT** instead of only localStorage names, so the backend can enforce ownership.
- **Starter board on guest creation** so new sessions are immediately usable.
- **Dedicated `/tasks/:id/move`** endpoint for reliable reorder + column moves.
- **SQLite by default** for frictionless local setup; PostgreSQL is supported by Prisma for production reliability.
- **Shared ModalShell** for Escape-to-close, backdrop click, focus, and `aria-modal`.

## Intentional Deviations From Figma

- Guest login screen is an assessment-specific addition (not part of the classic Kanban-only layout).
- HTML5 drag-and-drop is used instead of a heavier DnD library to keep the stack simple.
- Mobile uses a drawer sidebar + board picker for usability on small screens while keeping desktop Figma patterns (sidebar, theme toggle, rounded CTAs, column dots, card shadows).

## AI Usage

AI coding assistants were used for scaffolding, refactoring, and documentation. The implementation was reviewed, tested, and adjusted manually for correctness and assessment requirements.

## Testing

Recommended manual checks:

1. Guest A login → create Board A  
2. Guest B login (incognito) → create Board B  
3. Confirm A cannot see B’s boards (and vice versa)  
4. Drag tasks within and across columns → refresh → order preserved  
5. Theme toggle → refresh → theme persists  
6. Create / edit / delete boards, tasks, subtasks  
7. Resize to 375 / 768 / 1280 widths  

Automated:

```bash
cd backend && npm run build
cd frontend && npm run build
cd backend && npx prisma validate
```

## Future Improvements

- Touch-friendly drag-and-drop (pointer-based library)
- Optimistic UI updates
- Column reordering
- Automated e2e tests for ownership and reorder
- PostgreSQL as the default production database
