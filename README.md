# TaskFlow – Personal Task Manager

## 1. Project Title & Description

**TaskFlow** is a full-stack personal task manager built for Exercise 1. It allows a single user to create, view, update, and delete personal tasks. The app supports filtering by status, searching by title, drag-and-drop reordering, overdue highlighting, and persists all data on the backend across sessions.

---

## 2. Live Demo

🔗 **Frontend (Live):** https://task-manager-mu-wheat.vercel.app  
🔗 **Backend API (Live):** https://task-manager-w349.onrender.com

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 | Component-based UI, fast rendering |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Lightweight, accessible DnD for React |
| Styling | CSS3 + Google Fonts (Inter) | Clean custom design, no heavy UI library |
| Backend | Node.js + Express | Simple REST API, minimal setup |
| Storage | JSON file (tasks.json) | Zero-config persistence, no DB needed |
| IDs | uuid v4 | Unique task identifiers |
| Frontend Hosting | Vercel | Free, auto-deploys from GitHub |
| Backend Hosting | Render | Free Node.js hosting |

---

## 4. How to Run Locally

> Assumes you have **Node.js** installed. That's all you need.

### Step 1 – Clone the repo
```bash
git clone https://github.com/dikshajoshi1/Task_manager.git
cd Task_manager
```

### Step 2 – Start the Backend
```bash
cd backend
npm install
npm start
```
Backend runs at: **http://localhost:5000**

### Step 3 – Start the Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in frontend/package.json automatically routes API calls to the backend. No extra config needed.

---

## 5. API Documentation

Base URL (local): `http://localhost:5000`  
Base URL (production): `https://task-manager-w349.onrender.com`

### GET /api/tasks
Fetch all tasks, sorted by newest first.

- **Method:** GET  
- **Path:** `/api/tasks`  
- **Request Body:** None  
- **Response:**
```json
[
  {
    "id": "uuid-string",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "completed": false,
    "createdAt": "2026-06-07T14:30:00.000Z",
    "order": 0
  }
]
```

---

### POST /api/tasks
Create a new task.

- **Method:** POST  
- **Path:** `/api/tasks`  
- **Request Body:**
```json
{
  "title": "Buy groceries",        // required
  "description": "Milk, eggs",     // optional
  "dueDate": "2026-06-10"          // optional
}
```
- **Response:** `201 Created` — the created task object  
- **Error:** `400 Bad Request` if title is missing

---

### PUT /api/tasks/:id
Update an existing task (any fields).

- **Method:** PUT  
- **Path:** `/api/tasks/:id`  
- **Request Body (any combination):**
```json
{
  "title": "Updated title",
  "description": "Updated desc",
  "dueDate": "2026-06-15",
  "completed": true
}
```
- **Response:** `200 OK` — the updated task object  
- **Error:** `404 Not Found` if task ID doesn't exist

---

### DELETE /api/tasks/:id
Delete a task permanently.

- **Method:** DELETE  
- **Path:** `/api/tasks/:id`  
- **Request Body:** None  
- **Response:**
```json
{ "success": true }
```
- **Error:** `404 Not Found` if task ID doesn't exist

---

### PUT /api/tasks/reorder/bulk
Reorder all tasks (used by drag-and-drop).

- **Method:** PUT  
- **Path:** `/api/tasks/reorder/bulk`  
- **Request Body:**
```json
{
  "orderedIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```
- **Response:** `200 OK` — array of reordered task objects

---

## 6. Project Structure

```
Task_manager/
├── backend/
│   ├── server.js        ← Express REST API (all 5 endpoints)
│   ├── package.json     ← Dependencies: express, cors, uuid
│   └── tasks.json       ← Auto-created on first run; stores all tasks
│
└── frontend/
    ├── public/
    │   └── index.html   ← HTML shell for React app
    ├── src/
    │   ├── App.js        ← Main React component (all UI + logic)
    │   ├── App.css       ← All styles (light theme, responsive)
    │   └── index.js      ← React entry point
    └── package.json      ← Dependencies: react, @dnd-kit, react-scripts
```

---

## 7. Next Steps

**What I chose not to do (and why):**
- **User authentication** — the brief specified single-user, so login/signup was out of scope
- **Database (SQLite/PostgreSQL)** — JSON file storage is sufficient for a single-user demo; a real DB would be the first upgrade for multi-user support
- **Due time (not just date)** — kept it simple with date-only for cleaner UX

**What I would build next:**
- Migrate storage from JSON file to **SQLite** for reliable persistence on free cloud hosts
- Add **task categories / labels** with color coding
- Add **priority levels** (Low / Medium / High) with sorting
- **Email reminders** for due tasks using a cron job + nodemailer
- **Dark/light mode toggle** to complement the existing light theme
- **Mobile app** using React Native with the same backend API
