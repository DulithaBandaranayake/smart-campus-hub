# Smart Campus Operations Hub

A premium, full-stack Student Management System (SMS) built for modern educational institutions. This platform streamlines campus operations by providing dedicated portals for Administrators, Lecturers, Students, and Parents.

## 📋 Table of Contents
- [Technology Stack](#technology-stack)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#-installation--setup)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Database & Persistence](#database--persistence)
- [Default Demo Credentials](#default-demo-credentials)

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Spring Boot 3.2.4 (Java 17/21) |
| **Frontend** | React 18, Vite, TypeScript, Framer Motion |
| **Styling** | Vanilla CSS (Glassmorphism / Premium Aesthetics) |
| **Database** | MySQL 8.0 (Persistent H2 for dev/demo) |
| **Security** | JWT (JSON Web Tokens) & Spring Security |

## 🚀 Installation & Setup

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites
Before you begin, ensure you have the following installed:
- **Java Development Kit (JDK) 17 or higher** ([Download JDK](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18 or higher** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/downloads))

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/smart-campus-hub.git
cd smart-campus-hub
```

### 3. Install Dependencies
From the root directory, run the following command to install both backend and frontend dependencies:
```bash
npm run install:all
```

### 4. Environment Configuration
The project uses an `.env` file for environment variables. A template is provided in `.env.example`.
```bash
cp .env.example .env
```
*(On Windows PowerShell: `copy .env.example .env`)*

### 5. Launch the Application
Run the following command to start both the Spring Boot backend and the React frontend concurrently:
```bash
npm run dev
```

- **Backend:** [http://localhost:8082](http://localhost:8082)
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Interactive API Docs (Swagger):** [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)

## 🏗️ System Architecture

- **Unified Auth**: Users log in through a central portal; the system detects their role and routes them to the appropriate dashboard.
- **Entity Identification**: The system differentiates between `User` accounts and `Entity` profiles (Student, Parent, Lecturer), ensuring accurate data linkage for grades and attendance.

## ✨ Key Features

- **🛡️ Admin Control**: Full CRUD management of users and subjects. Unified view of all campus activity.
- **👨‍🏫 Lecturer Portal**: Record student marks, manage class schedules, and **create/manage their own subjects**.
- **🎓 Student Dashboard**: View academic progress, attendance summaries, and submit logical leave requests (with date validation).
- **👪 Parent Portal**: Track linked children's performance and review leave requests. Supports **multi-student linking** per parent.
- **📑 Leave Workflow**: Multi-stage approval process (Student → Parent → Admin).

## 💾 Database & Persistence

### Dev/Demo Mode (Default)
The project uses **Persistent H2**. Data is stored in `backend/data/smartcampus.mv.db`. Unlike standard H2, your data **will not be lost** when the server restarts.

### Production Mode (MySQL)
To switch to MySQL:
1. Update `backend/src/main/resources/application.properties`:
   - Set `spring.profiles.active=mysql`
   - Configure your MySQL credentials.
2. The system will automatically generate the schema on first run.

### Seeding Control
To prevent demo data from being recreated on every run, the `AdminDatabaseSeeder` only runs if the `User` table is empty. You can also disable it by setting `app.seed.enabled=false` in `application.properties`.

## 🔑 Default Demo Credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Administrator | admin@smartcampus.com | admin123 |
| **Lecturer** | Dr. Smith | smith@example.com | password123 |
| **Student** | Alice Student | alice@example.com | password123 |
| **Parent** | Akila Nexus | akila@nexus.com | password123 |

---
