const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "tasks.json");

app.use(cors());
app.use(express.json());

function readTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}


function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}


app.get("/api/tasks", (req, res) => {
  const tasks = readTasks();
  tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tasks);
});


app.post("/api/tasks", (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  const tasks = readTasks();
  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim() || "",
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
    order: tasks.length,
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});


app.put("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  writeTasks(tasks);
  res.json(tasks[idx]);
});


app.delete("/api/tasks/:id", (req, res) => {
  let tasks = readTasks();
  const exists = tasks.find((t) => t.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Task not found" });

  tasks = tasks.filter((t) => t.id !== req.params.id);
  writeTasks(tasks);
  res.json({ success: true });
});


app.put("/api/tasks/reorder/bulk", (req, res) => {
  const { orderedIds } = req.body;
  let tasks = readTasks();
  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const reordered = orderedIds.map((id, idx) => ({ ...taskMap[id], order: idx }));
  writeTasks(reordered);
  res.json(reordered);
});

app.listen(PORT, () => {
  console.log(`✅ Task Manager API running on http://localhost:${PORT}`);
});
