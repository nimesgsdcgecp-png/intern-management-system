# 📚 Complete Documentation

## Table of Contents

1. [Features Overview](#features-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Authentication System](#authentication-system)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Redux State Management](#redux-state-management)
7. [Email System](#email-system)
8. [Profile Management](#profile-management)
9. [Error Handling](#error-handling)
10. [Security Features](#security-features)

## Features Overview

### 🎯 Core Features

#### User Management
- **Role-based account creation** (Admin only)
- **Automated credential generation** with secure password hashing
- **Email delivery** of login credentials to new users
- **Profile management** for non-admin users

#### Task Management
- **Task creation** by Admin and Mentors
- **Priority levels**: Low, Medium, High
- **Status tracking**: Pending, In-Progress, Completed
- **Flexible assignment**: Individual interns or all interns
- **Deadline management** with date tracking

#### Report System
- **Daily/weekly report submission** by interns
- **Mentor feedback** system with rich text support
- **Hours worked tracking** with numeric precision
- **Date-based organization** of reports

#### Notification System
- **Real-time notifications** using Redux state
- **Email failure alerts** with retry mechanisms
- **User action feedback** (success, error, warning, info)
- **Persistent notifications** for critical actions

## User Roles & Permissions

### 👑 Admin Role
**Full system access with the following capabilities:**

- **User Management**
  - Create mentor and intern accounts
  - Edit user information (name, email, department)
  - Delete users (with cascade handling)
  - View all system users

- **Task Management**
  - Create tasks for any intern or all interns
  - Edit and delete any task
  - View all tasks across the system

- **System Monitoring**
  - Access to analytics dashboard
  - View system-wide statistics
  - Monitor user activity
  - Test email configuration

- **Restrictions**
  - Cannot access profile management (no profile)
  - Cannot submit reports (not an intern)

### 👨‍🏫 Mentor Role
**Intern supervision and guidance with the following capabilities:**

- **Intern Management**
  - View assigned interns only
  - Cannot create or delete interns
  - Cannot modify intern assignments

- **Task Management**
  - Create tasks for assigned interns
  - Edit tasks they created
  - View tasks for their interns

- **Report Management**
  - View reports from assigned interns
  - Provide feedback on reports
  - Cannot modify report content

- **Profile Management**
  - Update own email address
  - Change password with validation
  - View personal information

### 👨‍🎓 Intern Role
**Task execution and progress reporting with the following capabilities:**

- **Task Management**
  - View tasks assigned to them
  - Update task status (pending → in-progress → completed)
  - Cannot create or delete tasks

- **Report Management**
  - Submit daily/weekly reports
  - View their own report history
  - View mentor feedback

- **Profile Management**
  - Update own email address
  - Change password with validation
  - View personal information

- **Restrictions**
  - Cannot view other users' data
  - Cannot access admin features
  - Cannot assign tasks to others

## Authentication System

### 🔐 NextAuth.js Integration

The system uses **NextAuth.js v4** with custom credentials provider:

- **Dual Login Support**: Login by email or UUID
- **Password Security**: bcrypt verification with salt rounds
- **Session Management**: JWT-based tokens with role information
- **Route Protection**: Middleware-based authentication checks
- **CSRF Protection**: Built-in NextAuth.js security features

### 🔑 Session Structure

Sessions include user ID, name, email, role, and department for role-based access control.

## Database Schema

### 🗄️ PostgreSQL with UUID Primary Keys

The system uses a **normalized database design** with UUID primary keys for better scalability and security:

- **Users Table**: Core authentication with email, password hash, and role
- **Profiles Table**: User information including name, department, and phone
- **Interns Table**: Intern-specific data with mentor assignments and status
- **Tasks Table**: Task management with priority levels and assignments
- **Reports Table**: Progress tracking with mentor feedback
- **Password Reset Tokens**: Secure token management for password recovery

### 🔄 GraphQL Integration with Hasura

- **Real-time subscriptions** for live data updates
- **Automated API generation** from database schema
- **Role-based permissions** at the database level
- **Optimistic UI updates** with Apollo Client

## API Reference

### 🔌 Authentication Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handler
- `GET /api/auth/users` - Get all users (Admin only)
- `POST /api/auth/users` - Create new user account (Admin only)

### 👤 Profile Management

- `GET /api/profile` - Get current user's profile
- `PUT /api/profile` - Update user profile (email or password)

### 📋 Task Management

- `GET /api/tasks` - Get tasks (filtered by user role)
- `POST /api/tasks` - Create new task (Admin/Mentor only)
- `PUT /api/tasks/[id]` - Update task details
- `DELETE /api/tasks/[id]` - Delete task

### 📊 Report Management

- `GET /api/reports` - Get reports (filtered by user role)
- `POST /api/reports` - Submit report (Interns only)
- `PUT /api/reports/[id]` - Add mentor feedback

### 👥 Mentor Operations

- `GET /api/mentors` - Get all mentors
- `PUT /api/mentors/[id]` - Update mentor profile
- `DELETE /api/mentors/[id]` - Delete mentor account

### 📧 Email Services

- `POST /api/email` - Send system emails

## Redux State Management

### 🏪 Store Structure

The Redux store manages application state across four main slices:

- **UI State**: Sidebar collapse, theme, device type, animations
- **Loading State**: Global loading indicator and operation tracking
- **Notifications**: Toast notifications with type, title, message, and duration
- **Authentication**: User information and authentication status

### 🔔 Notification System

The notification system provides real-time feedback to users with four types:
- **Success**: Successful operations and confirmations
- **Error**: Failed operations and error messages
- **Warning**: Cautionary messages and fallbacks
- **Info**: General information and status updates

Notifications auto-dismiss after 5 seconds by default and are limited to 5 concurrent notifications.

## Email System

### 📧 SMTP Integration

The system supports email delivery for user credentials using Nodemailer:

- **Configurable SMTP**: Supports Gmail, Outlook, and custom SMTP servers
- **Credential Delivery**: Automated emails for new user accounts
- **Connection Testing**: SMTP verification for configuration validation
- **Error Handling**: Graceful fallbacks when email delivery fails

### 📬 Email Features

- **Welcome emails** for new mentors and interns
- **Password reset** emails with secure tokens
- **Credential delivery** with login instructions
- **User notifications** about email delivery status
- **Admin alerts** for configuration issues

## Profile Management

### 👤 User Profiles

All non-admin users can manage their profiles:

#### Email Updates
- **Validation**: Email format validation
- **Uniqueness**: Prevents duplicate email addresses
- **Real-time updates**: Changes reflect immediately

#### Password Changes
- **Current password verification**
- **Strength requirements**: 8+ characters, mixed case, numbers
- **Confirmation matching**
- **Secure hashing** with bcrypt

## Error Handling

### 🚨 Error Categories

- **Authentication Errors**: Invalid credentials, session expiration, role permission denials
- **Validation Errors**: Required fields, format validation, business rule validation
- **System Errors**: Database connections, GraphQL queries, email delivery failures

### 🔧 Error Recovery

- **Automatic retries** for transient failures
- **User-friendly messages** instead of technical errors
- **Logging** for debugging and monitoring
- **Fallback behaviors** for critical operations

## Security Features

### 🛡️ Multi-Layer Protection

- **UUID primary keys** prevent enumeration attacks
- **Bcrypt password hashing** with salt for secure storage
- **JWT token validation** for API access control
- **Role-based access control** at multiple application layers
- **Input sanitization** and validation for all user inputs
- **SQL injection protection** via parameterized GraphQL queries
- **XSS prevention** through React's built-in protections
- **CSRF protection** via NextAuth.js security features

---

For implementation details, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
For system architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)