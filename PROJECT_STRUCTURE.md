# 📂 Project Structure Guide

Welcome to the **Intern Management System**! This guide explains how the project is organized in a simple, easy-to-understand way.

---

## 🏗️ The Big Picture

The system is split into two main parts:
1.  **Frontend & API (Next.js)**: The website you see and the "brain" that handles data requests.
2.  **AI Assistant (ims-vannaAI)**: A special Python power-up that lets you ask questions about the data in plain English.

---

## 📁 Main Folders

### 1. `app/` (The Application Heart)
This is where the Next.js code lives. It's organized using the "App Router" pattern.
-   **`api/`**: The backend endpoints. When the website needs to "get" or "save" data, it talks to these files.
-   **`auth/`**: Contains the Login and Sign-up pages.
-   **`dashboard/`**: The main screens for Admins, Mentors, and Interns.
-   **`profile/`**: Where users can update their account settings.
-   **`components/`**: Reusable building blocks (buttons, menus, cards).
    -   `ui/`: Base elements like buttons and inputs.
    -   `layout/`: Large structures like the sidebar and headers.
    -   `features/` : Complex modules like the Task Board (Kanban) or Attendance table.
    -   `providers/`: "Invisible" helpers that handle things like global state (Redux) and authentication.

### 2. `lib/` (The Toolbox)
Shared logic and helpers used across the entire application.
-   **`services/`**: The real "work" logic (e.g., how to calculate stats, how to send emails).
-   **`auth.ts`**: Configuration for how users log in (NextAuth).
-   **`db.ts`**: The connection to the PostgreSQL database.
-   **`hasura.ts`**: Helps the app talk to the GraphQL engine (Hasura).
-   **`constants.ts`**: A single place for all "fixed" values like status names and roles.

### 3. `ims-vannaAI/` (AI Powerhouse)
A separate Python-based system.
-   **`app.py`**: The main AI application.
-   **`train_agent.py`**: Logic used to "teach" the AI about your database so it can answer questions.
-   **`chroma_db/`**: The "memory" of the AI.

### 4. `sql/` (Database Blueprint)
Contains `schema.sql`, which is the set of instructions to build the database tables (Users, Tasks, Reports, etc.).

### 5. `types/` (TypeScript Definitions)
Describes what the data looks like (e.g., "A 'Task' must have a title and a deadline"). This helps prevent coding mistakes.

### 6. `docs/` (Manuals)
Extra documentation files if you want to dive deep into how things were built.

---

## 📄 Key Configuration Files

-   **`.env`**: Your "Secret Box." It stores passwords and database links. **Never share this!**
-   **`package.json`**: A list of all the "ingredients" (libraries) needed to run the app.
-   **`docker-compose.yml`**: Instructions to start the database and Hasura engine automatically using Docker.
-   **`middleware.ts`**: The "Security Guard." It checks if a user is logged in before letting them see certain pages.
-   **`next.config.mjs`**: Settings for how the Next.js server should behave.

---

## 💡 Summary for Developers

| Folder | Responsibility |
| :--- | :--- |
| **`app/`** | UI Screens + API Routes |
| **`lib/`** | Logic, Helpers, and DB Connection |
| **`components/`** | Visual elements (UI, Layout, Features) |
| **`ims-vannaAI/`** | Python AI Assistant |
| **`sql/`** | Database Schema |
| **`types/`** | Data shape definitions |

*This file was created to help you navigate the codebase quickly. Happy coding!* 🚀
