# Smart Campus Operations Hub

A premium, full-stack campus management system for modern universities. Manage facilities, bookings, maintenance tickets, and notifications.

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Spring Boot 3.2.4 (Java 17) |
| **Frontend** | React 18, Vite, TypeScript |
| **Styling** | Premium Glassmorphism UI |
| **Database** | H2 (dev) / MySQL (prod) |
| **Security** | JWT + Spring Security |

## Quick Start

```bash
# Install dependencies
npm run install:all

# Run both frontend & backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8082

## Features

- **Module A:** Facilities & Assets Catalogue (rooms, labs, equipment)
- **Module B:** Booking Management with conflict detection
- **Module C:** Maintenance & Incident Ticketing with image attachments
- **Module D:** Notifications for status changes
- **Module E:** Role-based access (USER, ADMIN, TECHNICIAN)

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@smartcampus.com | admin123 |
| TECHNICIAN | tech@smartcampus.com | tech123 |
| USER | user@example.com | user123 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend & backend |
| `npm run frontend` | Run only frontend (port 5173) |
| `npm run backend` | Run only backend (port 8082) |
| `npm run clean` | Clean build files |
| `npm run install:all` | Install all dependencies |

## Requirements

- Node.js 18+
- Java 17+
- Maven 3.9+

Works on **Linux, macOS, and Windows**.