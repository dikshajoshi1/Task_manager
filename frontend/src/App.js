import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./App.css";

const API = "/api/tasks";

// ─── Sortable Task Card ──────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const formatDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.completed ? "completed" : ""} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <span>⠿</span>
      </div>

      <button
        className={`checkbox ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task)}
        aria-label="Toggle complete"
      >
        {task.completed && <span>✓</span>}
      </button>

      <div className="task-content">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          {task.dueDate && (
            <span className={`due-badge ${isOverdue ? "overdue-badge" : ""}`}>
              {isOverdue ? "⚠ Overdue · " : "📅 "}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="created-badge">
            Added {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button className="btn-icon edit" onClick={() => onEdit(task)} title="Edit">
          ✏️
        </button>
        <button className="btn-icon delete" onClick={() => onDelete(task.id)} title="Delete">
          🗑️
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [formError, setFormError] = useState("");

  // Confirm delete
  const [deleteId, setDeleteId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Open add modal
  const openAdd = () => {
    setEditingTask(null);
    setForm({ title: "", description: "", dueDate: "" });
    setFormError("");
    setShowModal(true);
  };

  // Open edit modal
  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setFormError("");
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };
    try {
      if (editingTask) {
        const res = await fetch(`${API}/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setTasks((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      setFormError("Something went wrong. Please try again.");
    }
  };

  // Toggle complete
  const handleToggle = async (task) => {
    const res = await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Delete (confirmed)
  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteId(null);
  };

  // Drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = tasks.findIndex((t) => t.id === active.id);
    const newIdx = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIdx, newIdx);
    setTasks(reordered);

    await fetch(`${API}/reorder/bulk`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
    });
  };

  // Filtered + searched tasks
  const visible = tasks.filter((t) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && !t.completed) ||
      (filter === "Completed" && t.completed);
    const matchesSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">✓</div>
            <div>
              <h1>TaskFlow</h1>
              <p>Your personal task manager</p>
            </div>
          </div>
          <button className="btn-add" onClick={openAdd}>
            + New Task
          </button>
        </div>
      </header>

      <main className="main">
        {/* ── Stats ── */}
        <div className="stats-bar">
          <div className="stat active-stat">
            <span className="stat-num">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-divider" />
          <div className="stat completed-stat">
            <span className="stat-num">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-divider" />
          <div className="stat total-stat">
            <span className="stat-num">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        {/* ── Search + Filter ── */}
        <div className="controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
          <div className="filter-tabs">
            {["All", "Active", "Completed"].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Task List ── */}
        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Loading your tasks…</p>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <p>⚠️ {error}</p>
            <button className="btn-retry" onClick={fetchTasks}>
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="state-box empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              {search
                ? `No tasks matching "${search}"`
                : filter === "Completed"
                ? "No completed tasks yet"
                : filter === "Active"
                ? "No active tasks — great job!"
                : "No tasks yet"}
            </h3>
            <p>
              {!search && filter === "All" && "Click + New Task to get started!"}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visible.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="task-list">
                {visible.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? "Edit Task" : "Add New Task"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }));
                  setFormError("");
                }}
                autoFocus
              />
              {formError && <p className="form-error">{formError}</p>}

              <label>Description</label>
              <textarea
                placeholder="Optional details…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />

              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSubmit}>
                {editingTask ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Task?</h2>
            </div>
            <div className="modal-body">
              <p>This action cannot be undone. Are you sure you want to delete this task?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={() => handleDelete(deleteId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
