# TaskPulse Enterprise 🚀 — Real-Time Collaborative Workspace SaaS

**TaskPulse Enterprise** is an enterprise-grade, real-time team collaboration platform designed for high-velocity software engineering, design, and product teams. Inspired by Linear and Jira, TaskPulse combines native **HTML5 drag-and-drop Kanban boards**, **real-time Socket.IO WebSockets synchronization**, **global Command Palette search (`Cmd+K`)**, **Subtask checklists**, **Activity Audit Logs**, and **Dark/Light Theme Modes**.

---

## ✨ Enterprise Features

### 🎨 1. Modern SaaS UI & Dual Theme System
- **TaskPulse Design System**: Built with CSS variable tokens supporting **Dark Space Obsidian (`#090d16`)** and **Clean Studio Light (`#fafafa`)** themes with instant toggle support.
- **Glassmorphism Panels**: Backdrop blur (`backdrop-filter: blur(16px)`), neon accents, and smooth spring physics hover transitions.

### 📋 2. Native Drag and Drop Kanban Board
- **Fluid HTML5 Drag & Drop**: Drag task cards between columns (`To Do`, `In Progress`, `Under Review`, `Completed`) with drop target visual indicators.
- **Chevron Quick Transfer Fallback**: Single-click quick column movement buttons.
- **Priority Badges**: Visual indicators for `Urgent`, `High`, `Medium`, and `Low` priority levels.
- **View Switcher**: Toggle between interactive **Kanban Board** view and **Calendar Schedule** view.

### ⚡ 3. Global Command Palette (`Cmd+K` / `Ctrl+K`)
- **Keyboard-First Navigation**: Open overlay with `Cmd+K` or `Ctrl+K` to search across all workspace projects, execute system actions (`Toggle Theme`, `Create Project`, `Create Task`), and jump between views without touching the mouse.

### 📝 4. Subtask Checklists & Activity Audit Trail
- **Subtasks Progress Ring**: Add subtasks, toggle completions with interactive progress bars on task cards.
- **Activity Audit Trail**: Live log drawer tracking every status change, task creation, comment, and member addition across the project space.

### 🔐 5. Security, Auth & 1-Click Demo Personas
- **JWT Authentication & Password Hashing**: Password hashing via `bcryptjs` (10 rounds) and token authorization headers.
- **Request Validation Middleware**: API protection against invalid inputs and missing parameters.
- **Instant Demo Logins**:
  - 👑 **Prakhar Raj** (`prakhar@example.com`) — Project Owner
  - 👩‍💻 **Ananya Sharma** (`ananya@example.com`) — Team Lead
  - 👨‍💻 **Shreyansh Shivhari** (`shreyansh@example.com`) — Developer

### ⚡ 6. Real-time WebSockets Synchronization & Notifications
- **Live Board Syncing**: Instant Socket.IO broadcasting across project rooms (`project:id`).
- **Notification Drawer**: Real-time toast popups + persistent drawer with unread count badges and tab filters.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide React Icons, Socket.io-client, CSS Variables Design Token System |
| **Backend** | Node.js, Express.js, Socket.IO Server, Custom Input Validation Middleware |
| **Database** | Persistent Relational Data Abstraction Layer (`server/db.js`) with seed workspace data |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shreyanshshivhari/codealpha_task3.git
cd codealpha_task3

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Run Application
```bash
# Build production bundle and start server
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

### 3. Run Automated Integration Tests
```bash
npm test
```

---

## 🐳 Docker Deployment

To build and run the entire application inside Docker:

```bash
# Build and run containerized TaskPulse app
docker-compose up --build
```
Access at **`http://localhost:5000`**.

---

## 🔌 API Endpoint Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/auth/users` | Search team members |

### Project Routes (`/api/projects`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Fetch user's workspace group projects |
| `POST` | `/api/projects` | Create a new group project |
| `GET` | `/api/projects/:id` | Fetch specific project details & member list |
| `POST` | `/api/projects/:id/members` | Invite member to project |

### Task Routes (`/api/projects/:projectId/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/tasks` | Fetch tasks and activity logs for board |
| `POST` | `/api/projects/:projectId/tasks` | Create a new task card |
| `PUT` | `/api/projects/:projectId/tasks/:id` | Update task status, priority, description, tags, or assignee |
| `POST` | `/api/projects/:projectId/tasks/:id/subtasks` | Add subtask item |
| `PATCH` | `/api/projects/:projectId/tasks/:id/subtasks/:subtaskId/toggle` | Toggle subtask completion |
| `DELETE` | `/api/projects/:projectId/tasks/:id` | Delete a task card |

---

## 📄 License
Developed for **CodeAlpha Full-Stack Internship (Task 3)**.
