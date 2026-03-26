# 🏗️ System Architecture

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Database Design](#database-design)
5. [Authentication Architecture](#authentication-architecture)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [State Management Architecture](#state-management-architecture)
9. [Security Architecture](#security-architecture)

## Architecture Overview

### 🎯 System Design Philosophy

The Intern Management System follows a **modern full-stack architecture** with the following principles:

- **Separation of Concerns**: Clear boundaries between presentation, business logic, and data layers
- **Type Safety**: End-to-end TypeScript for reduced runtime errors
- **Database-First Design**: PostgreSQL + GraphQL for flexible data fetching
- **Multi-Layer Security**: Authentication, authorization, and data validation

### 📊 High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │    │  Hasura Graph   │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  Pages/   │  │    │  │ GraphQL   │  │    │  │  Tables   │  │
│  │ Components│  │◄───┤  │    API    │  │◄───┤  │ & Relations│  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ API Routes│  │    │  │Permissions│  │    │  │   Indexes  │  │
│  └───────────┘  │    │  │& Metadata │  │    │  │ & Triggers │  │
│                 │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redux       │    │   NextAuth.js   │    │   Email Service │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   Store   │  │    │  │ JWT Tokens│  │    │  │ Nodemailer │  │
│  │ & Slices  │  │    │  │ & Sessions│  │    │  │    SMTP    │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### 🏛️ Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 16+ | React framework with SSR/SSG |
| **Language** | TypeScript | 5+ | Type-safe development |
| **Styling** | Tailwind CSS | 4+ | Utility-first CSS framework |
| **Database** | PostgreSQL | 14+ | Relational database with ACID properties |
| **GraphQL** | Hasura | 2.33+ | Auto-generated GraphQL API |
| **Authentication** | NextAuth.js | 4+ | Authentication framework |
| **State Management** | Redux Toolkit | 2+ | Client-side state management |
| **Animations** | Framer Motion | 12+ | Smooth UI animations |

## Data Flow Architecture

### 🔄 Request/Response Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. HTTP Request
       ▼
┌─────────────┐
│  Next.js    │ 2. Route Matching
│ Middleware  │ 3. Auth Check
└──────┬──────┘
       │ 4. Forward to Handler
       ▼
┌─────────────┐
│  API Route  │ 5. Business Logic
│  Handler    │ 6. Validation
└──────┬──────┘
       │ 7. GraphQL Query/Mutation
       ▼
┌─────────────┐
│   Hasura    │ 8. Permission Check
│  GraphQL    │ 9. Query Optimization
└──────┬──────┘
       │ 10. SQL Query
       ▼
┌─────────────┐
│ PostgreSQL  │ 11. Data Retrieval
│  Database   │ 12. ACID Transaction
└──────┬──────┘
       │ 13. Result Set
       ▼
┌─────────────┐
│   Hasura    │ 14. JSON Response
│  GraphQL    │ 15. Data Transformation
└──────┬──────┘
       │ 16. Formatted Response
       ▼
┌─────────────┐
│  API Route  │ 17. Error Handling
│  Handler    │ 18. Response Formation
└──────┬──────┘
       │ 19. HTTP Response
       ▼
┌─────────────┐
│   Next.js   │ 20. Response Processing
│ Middleware  │ 21. Headers Setting
└──────┬──────┘
       │ 22. HTTP Response
       ▼
┌─────────────┐
│   Browser   │ 23. Response Handling
└─────────────┘ 24. UI Update
```

### 📱 Client-Side Data Flow

```
┌─────────────┐
│ User Action │ (Button Click, Form Submit)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Component  │ Event Handler
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Redux     │ Action Dispatch
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Redux     │ State Update
│  Reducer    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    API      │ HTTP Request
│    Call     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Component   │ Re-render with
│  Re-render  │ Updated State
└─────────────┘
```

## Database Design

### 🗄️ Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     USERS       │     │    PROFILES     │     │     INTERNS     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │◄────┤ user_id (UUID)  │     │ user_id (UUID)  │◄─┐
│ email (UNIQUE)  │     │ name            │     │ mentor_id       │  │
│ password_hash   │     │ department      │     │ admin_id        │  │
│ role (ENUM)     │     │ phone           │     │ start_date      │  │
│ created_at      │     │ created_at      │     │ end_date        │  │
│ updated_at      │     │ updated_at      │     │ status (ENUM)   │  │
└─────────────────┘     └─────────────────┘     │ college_name    │  │
                                                │ university      │  │
                                                │ created_at      │  │
                                                │ updated_at      │  │
                                                └─────────────────┘  │
                                                                     │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  │
│     TASKS       │     │ TASK_ASSIGNMENTS│     │    REPORTS      │  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤  │
│ id (UUID) PK    │────►│ task_id (UUID)  │     │ id (UUID) PK    │  │
│ title           │     │ intern_id       │◄────┤ intern_id       │◄─┘
│ description     │     │ assigned_at     │     │ report_date     │
│ assigned_by     │     └─────────────────┘     │ work_description│
│ assigned_to_all │                             │ hours_worked    │
│ deadline        │                             │ mentor_feedback │
│ priority (ENUM) │                             │ submitted_at    │
│ status (ENUM)   │                             └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│PASSWORD_RESET   │
│     TOKENS      │
├─────────────────┤
│ id (UUID) PK    │
│ email           │
│ token (HASH)    │
│ otp_code        │
│ type (ENUM)     │
│ expires_at      │
│ attempts        │
│ used_at         │
│ created_at      │
└─────────────────┘
```

### 🔑 Key Database Features

- **UUID Primary Keys**: Better security and distributed systems support
- **Normalized Design**: Three-table structure (users → profiles → interns)
- **Foreign Key Constraints**: Data integrity with CASCADE/SET NULL
- **Performance Indexes**: Strategic indexing for frequent queries

## Authentication Architecture

### 🔐 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │    │  NextAuth   │    │  Database   │    │  JWT Token  │
│   Request   │    │ Credentials │    │   Query     │    │  Generation │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. POST          │                  │                  │
       │ /auth/signin     │                  │                  │
       ├─────────────────►│                  │                  │
       │                  │ 2. Validate      │                  │
       │                  │ Credentials      │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │ 3. User Lookup   │
       │                  │                  │ & Password Check │
       │                  │◄─────────────────┤                  │
       │                  │ 4. User Data     │                  │
       │                  │                  │                  │
       │                  │ 5. Create JWT    │                  │
       │                  ├─────────────────────────────────────►│
       │                  │                  │                  │ 6. Signed Token
       │                  │◄─────────────────────────────────────┤ with User Info
       │ 7. Set Cookie    │                  │                  │
       │ & Redirect       │                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
```

### 🔒 Role-Based Access Control (RBAC)

```
                    ┌─────────────────┐
                    │      ADMIN      │
                    │                 │
                    │ • Full Access   │
                    │ • User Mgmt     │
                    │ • System Config │
                    └─────────┬───────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │     MENTOR     │         │     INTERN     │
        │                │         │                │
        │ • Assigned     │         │ • Own Tasks    │
        │   Interns      │         │ • Own Reports  │
        │ • Task Mgmt    │         │ • Profile Mgmt │
        │ • Report Review│         └────────────────┘
        │ • Profile Mgmt │
        └────────────────┘
```

## API Architecture

### 🔌 RESTful API Design

#### Endpoint Structure
```
/api/
├── auth/                  # Authentication & user management
├── profile/               # User profile management
├── mentors/              # Mentor operations
├── interns/              # Intern management
├── tasks/                # Task operations
├── reports/              # Report management
└── email/                # Email services
```

## Frontend Architecture

### ⚛️ Component Hierarchy

```
app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Landing page
├── auth/
│   ├── login/page.tsx         # Login form
│   ├── forgot-password/       # Password reset flow
│   └── reset-password/
├── dashboard/
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── interns/page.tsx   # Intern management
│   │   ├── mentors/page.tsx   # Mentor management
│   │   └── tasks/page.tsx     # Task creation
│   ├── mentor/
│   │   ├── page.tsx           # Mentor dashboard
│   │   ├── reports/page.tsx   # Report reviews
│   │   └── tasks/page.tsx     # Task assignments
│   └── intern/
│       ├── page.tsx           # Intern dashboard
│       └── reports/page.tsx   # Report submissions
├── profile/page.tsx           # Profile management
└── components/
    ├── ui/                    # Base UI components
    ├── forms/                 # Form components
    ├── layouts/               # Layout components
    └── features/              # Feature-specific components
```

## State Management Architecture

### 🏪 Redux Store Structure

```
Store
├── ui/
│   ├── sidebarCollapsed: boolean
│   ├── theme: "light" | "dark"
│   ├── deviceType: "mobile" | "tablet" | "desktop"
│   └── animationsEnabled: boolean
├── loading/
│   ├── globalLoading: boolean
│   └── operations: Record<string, string>
├── notifications/
│   └── notifications: Notification[]
└── auth/
    ├── user: User | null
    └── isAuthenticated: boolean
```

## Security Architecture

### 🛡️ Multi-Layer Security

- **HTTPS/TLS**: Encrypted data transmission
- **JWT Authentication**: Stateless authentication with NextAuth.js
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via GraphQL
- **Role-Based Access**: Permission-based endpoint access
- **UUID Primary Keys**: Prevent enumeration attacks

---

For detailed feature documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)
For implementation details, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)