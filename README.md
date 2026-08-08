# TaskNest

TaskNest is a premium, highly responsive Task Management System designed to help users organize work visually using Kanban boards. It features customizable boards, subtask tracking checklist, light/dark theme persistence, and a quick Guest Login.

The application is structured as a dual-folder project containing:
1. **`/backend`**: Built with NestJS, TypeScript, and SQLite (via Prisma v6).
2. **`/frontend`**: Built with Next.js (App Router, Turbopack, React 19) and Tailwind CSS v4.

---

## Technical Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons, HTML5 Drag & Drop API.
- **Backend**: NestJS, class-validator, DTO validation.
- **Database**: SQLite, Prisma ORM v6.
- **Language**: TypeScript (strict mode enabled across both apps).

---

## Local Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed.

### Step 1: Install Dependencies
From the root directory, run install on both the frontend and backend:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Verify or create the `.env` file in the `/backend` folder:
- **Location**: `backend/.env`
```env
DATABASE_URL="file:./dev.db"
PORT=4000
```
*(No environment config is required for the frontend by default; it connects to `http://localhost:4000/api` which is configured as the fallback.)*

### Step 3: Run Database Migrations & Seed Data
Initialize the SQLite database schema and run the seed script to pre-populate boards and tasks:
```bash
cd ../backend
npx prisma migrate dev --name init
npx prisma db seed
```
This generates the Prisma Client and populates the database with default boards: **Platform Launch** and **Marketing Plan**, both filled with tasks and subtasks checklist.

---

## Running the Application Locally

You need to run both the NestJS backend and Next.js frontend concurrently.

### 1. Start the Backend API
In your terminal, navigate to `/backend` and run:
```bash
npm run start:dev
```
The NestJS API will start on **`http://localhost:4000`**. You can verify it by checking the endpoint **`http://localhost:4000/api/boards`** in your browser or postman.

### 2. Start the Frontend
Open a new terminal window, navigate to `/frontend` and run:
```bash
npm run dev
```
The Next.js web application will start on **`http://localhost:3000`**. Open your browser and navigate to **`http://localhost:3000`** to view the app.

---

## Features Showcase
1. **Guest Login**: Instant guest authentication. Input your preferred name and access the board workspace immediately. Persisted via `localStorage`.
2. **Board Management**: Create new boards, edit board names, and add/remove columns. Deleting a column warns you that tasks inside it will be deleted.
3. **Kanban Grid & Drag-and-Drop**: Drag task cards between columns (Todo, Doing, Done) using HTML5 Native Drag & Drop. The task status and database are updated in real-time.
4. **Task Forms & Subtasks Checklist**: Create or edit tasks, add descriptions, and dynamically add/remove checklist items. Toggle subtask checkboxes directly from the Task Details popup.
5. **Theme Switcher**: Toggle between light and dark mode in the sidebar. Theme choices are stored in `localStorage` and applied via CSS selectors instantly.

---

## Design Workarounds & Deviations

> [!NOTE]
> **Figma Visual Inspection Workaround**: Due to a system compatibility issue launching Playwright's browser manager (`%1 is not a valid Win32 application` error when launching Node.exe), the Figma URL was visually inaccessible.
>
> **Workaround**: We implemented a highly-polished dashboard layout inspired by standard premium Kanban guidelines (such as the classic Frontend Mentor design). It incorporates a collapsible sidebar, a clean grid layout, and custom light/dark color variables.

> [!TIP]
> **Prisma ORM Selection**: We utilized Prisma v6.2.1 for database relations to avoid v7's strict native compilation driver requirement (`better-sqlite3`), preventing runtime C++ compilation failures on Windows.

---

## Deployment Instructions

Both apps are structured for standalone deployment.

### Backend (Render or Railway)
1. Push the code to a Git repository.
2. Link the repository to your host (e.g., Render Web Service).
3. Set the **Root Directory** to `backend`.
4. Configure the **Build Command**:
   ```bash
   npm install && npm run build
   ```
5. Configure the **Start Command**:
   ```bash
   npx prisma migrate deploy && node dist/main.js
   ```
6. Add the Environment Variable `DATABASE_URL` pointing to a persistent volume SQLite storage path (e.g. `file:/var/data/dev.db`) or configure a PostgreSQL database (Prisma lets you switch providers by changing the provider string in `schema.prisma`).

### Frontend (Vercel)
1. Push the code to a Git repository.
2. Link it on Vercel as a new project.
3. Set the **Root Directory** to `frontend`.
4. Vercel will automatically detect Next.js settings.
5. Add the Environment Variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend API URL (e.g., `https://tasknest-api.onrender.com/api`).
6. Click **Deploy**.
