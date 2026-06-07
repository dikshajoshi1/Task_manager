# TaskFlow – Personal Task Manager

A full-stack personal task manager built with **React + Node.js/Express + JSON file storage**.

---

## 📁 Project Structure

```
task-manager/
├── backend/          ← Node.js Express API
│   ├── server.js
│   ├── package.json
│   └── tasks.json    ← auto-created on first run
└── frontend/         ← React App
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

---

## 🚀 Run on Your PC (Local Development)

### Step 1 – Start the Backend

```bash
cd task-manager/backend
npm install
npm start
```

Backend runs at: **http://localhost:5000**

> For auto-restart on file changes: `npm run dev` (uses nodemon)

---

### Step 2 – Start the Frontend

Open a **new terminal**:

```bash
cd task-manager/frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in frontend's package.json automatically routes API calls to the backend.

---

## ✅ Features Implemented

| Feature | Status |
|---|---|
| Add task (title required, description + due date optional) | ✅ |
| View tasks sorted by newest first | ✅ |
| Mark task complete / incomplete (toggle) | ✅ |
| Edit task (title, description, due date) | ✅ |
| Delete task with confirmation prompt | ✅ |
| Filter by All / Active / Completed | ✅ |
| Active vs Completed count on screen | ✅ |
| Visually distinguish overdue tasks | ✅ |
| Empty state UI | ✅ |
| Search tasks by title | ✅ |
| Persist tasks across restarts (JSON file) | ✅ |
| Drag-and-drop to reorder tasks | ✅ |

---

## 🌍 Deploy for FREE

### Option A: Railway (Recommended – easiest, one platform)

1. Push your code to **GitHub** (create a repo, push both frontend and backend folders).

2. Go to **https://railway.app** → Sign up free with GitHub.

3. **Deploy Backend:**
   - New Project → Deploy from GitHub Repo → select `backend` folder
   - Railway auto-detects Node.js and runs `npm start`
   - Copy the generated URL (e.g. `https://your-app.railway.app`)

4. **Deploy Frontend:**
   - In `frontend/package.json`, replace the proxy line:
     ```json
     "proxy": "https://your-app.railway.app"
     ```
   - Or set `REACT_APP_API_URL=https://your-app.railway.app` as env variable
     and update `const API = process.env.REACT_APP_API_URL + "/api/tasks"` in App.js
   - New Project → Deploy from GitHub Repo → select `frontend` folder
   - Add build command: `npm run build`
   - Add start command: `npx serve -s build`

---

### Option B: Render (Backend) + Vercel (Frontend)

**Backend on Render (free):**
1. Go to **https://render.com** → New → Web Service
2. Connect GitHub → select backend folder
3. Build command: `npm install`
4. Start command: `node server.js`
5. Copy the URL (e.g. `https://taskflow-api.onrender.com`)

> ⚠️ Free Render instances sleep after 15 min inactivity. First request may be slow.

**Frontend on Vercel (free):**
1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo → set root to `frontend`
3. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: your Render backend URL
4. In `App.js`, change:
   ```js
   const API = (process.env.REACT_APP_API_URL || "") + "/api/tasks";
   ```
5. Deploy → get a free `.vercel.app` URL

---

## 🗃️ Data Storage

Tasks are stored in `backend/tasks.json`. This file is auto-created on first run. On cloud platforms, the file resets when the server restarts (free tier). For permanent storage, upgrade to SQLite or a free DB like **Supabase** (PostgreSQL).

---

## 🛠 Tech Stack

- **Frontend:** React 18, @dnd-kit (drag & drop), Google Fonts
- **Backend:** Node.js, Express, UUID
- **Storage:** JSON file (upgradeable to SQLite/PostgreSQL)
