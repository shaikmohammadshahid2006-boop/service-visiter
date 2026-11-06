# ServiceVisit Tracker – Home Service Appointment Manager

[![Full-Stack Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)](#)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-61dafb.svg)](#)
[![Node & Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](#)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47a248.svg)](#)

**ServiceVisit Tracker** is a full-stack home service appointment management platform that connects homeowners with certified household service providers (electricians, plumbers, HVAC technicians, carpenters, painters).

---

## 1. Core Problems Solved

1. **Disagreements about appointment timings**: Real-time status transitions with immutable audit history timestamps.
2. **Misunderstandings about requested work**: Initial description is locked upon provider acceptance into a binding Work Order.
3. **Unrecorded changes in service scope**: Structured Scope Change requests require explicit counter-approval before any new work or cost additions can proceed. Original scope is never overwritten.
4. **Disputes about whether work was completed**: Mandatory photographic evidence (before & after photos) and contractor completion summaries.
5. **Lack of customer confirmation**: Work is never finalized automatically when a provider marks it done. Customers review photographic evidence and explicitly approve sign-off or report issues.

---

## 2. Technology Stack

- **Frontend**:
  - React.js 18 + Vite
  - TypeScript
  - Tailwind CSS
  - React Router DOM v7
  - Axios with interceptors
  - Lucide React icons
- **Backend**:
  - Node.js & Express.js
  - TypeScript (`tsx` development runtime, `tsc` compilation)
  - REST API architecture
  - Helmet security headers, CORS, Morgan logger
  - Express Rate Limiting
- **Database**:
  - MongoDB + Mongoose ODM
  - Out-of-the-box embedded `MongoMemoryServer` fallback for instant zero-config local runs, with seamless MongoDB Atlas connection when `MONGODB_URI` is provided.
- **Authentication**:
  - JSON Web Tokens (JWT)
  - bcrypt password hashing (10 salt rounds)
  - Role-based access control (Customer, Service Provider, Admin)
- **Validation & Error Handling**:
  - Zod schemas with centralized request validation middleware
  - Standardized JSON error response middleware

---

## 3. Seed Demo Accounts & Roles

The system includes pre-seeded data across all three user roles with complete appointment, work order, scope change, completion, and dispute histories.

| Role | Name | Email | Password | Pre-seeded Context |
|---|---|---|---|---|
| **Customer** | Alex Rivera | `alex@example.com` | `Customer123!` | Has completed EV charger job awaiting customer sign-off & active drain dispute |
| **Customer** | David Chen | `david@example.com` | `Customer123!` | Has active AC job with pending $135 scope change awaiting approval |
| **Customer** | Sarah Connor | `sarah@example.com` | `Customer123!` | Has pending electrical booking and finalized HVAC job with 5-star review |
| **Provider** | Marcus Vance | `marcus@vanceelectric.com` | `Provider123!` | Master Electrician ($85/hr); has pending incoming booking from Sarah |
| **Provider** | Liam Gallagher | `liam@apexair.com` | `Provider123!` | HVAC Specialist ($110/hr); has active in-progress job with David |
| **Provider** | Elena Rostova | `elena@premierflow.com` | `Provider123!` | Certified Plumber ($95/hr); has active dispute discussion with Alex |
| **Admin** | Administrator | `admin@servicevisit.com` | `AdminPass123!` | Platform Admin; access to analytics, dispute triage, category CRUD, user controls |

> **Pro-Tip:** The app features an interactive **1-Click Demo Switcher** bar at the top of the interface allowing instant switching between any of these roles!

---

## 4. Project Structure

```
servicevisit-tracker/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (StatusBadge, Modal, DemoBanner, etc.)
│   │   ├── context/            # AuthContext (login, role switcher, profile)
│   │   ├── layouts/            # PublicLayout and DashboardLayout
│   │   ├── pages/              # Customer, Provider, and Admin dashboards
│   │   ├── services/           # Axios API service
│   │   ├── types/              # Full TypeScript schema interfaces
│   │   ├── App.tsx             # Application router & role-protected routes
│   │   ├── main.tsx            # DOM entry
│   │   └── index.css           # Tailwind base styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Database connection & memory fallback
│   │   ├── controllers/        # REST API Controllers (Auth, Appts, WorkOrders, etc.)
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── models/             # Mongoose Models (11 collections)
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # In-app notification engine
│   │   ├── types/              # Auth request augmentations
│   │   ├── utils/              # ID generators & database seeders
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap & auto-seeder
│   ├── package.json
│   └── tsconfig.json
├── package.json                # Root package manager
├── .gitignore
└── README.md
```

---

## 5. Local Setup & Quick Start

### Prerequisites
- Node.js v18 or higher (tested on v24.15.0)
- npm v9 or higher

### Installation

1. Clone or extract the repository and navigate to the project directory:
   ```bash
   cd "ServiceVisit Tracker"
   ```

2. Install dependencies for both client and server:
   ```bash
   npm run install:all
   ```

3. Start the Backend API (runs on `http://localhost:5000` with automatic in-memory MongoDB):
   ```bash
   npm run dev:server
   ```

4. In a separate terminal, start the Frontend (runs on `http://localhost:5173`):
   ```bash
   npm run dev:client
   ```

5. Open your browser at `http://localhost:5173`. You can immediately click any role on the **Interactive Demo Mode** banner or sign in using any of the credentials listed above!

---

## 6. REST API Endpoints

### Authentication
- `POST /api/auth/register`: Register new Customer or Service Provider
- `POST /api/auth/login`: Authenticate user and receive JWT
- `GET /api/auth/me`: Get current authenticated user profile
- `PUT /api/auth/profile`: Update profile, home address, or provider rate

### Service Categories & Providers
- `GET /api/services`: List all active service categories
- `POST /api/services`: Create service category (*Admin only*)
- `PUT /api/services/:id`: Update category (*Admin only*)
- `DELETE /api/services/:id`: Delete category (*Admin only*)
- `GET /api/services/providers`: List service providers with rating/category filters
- `GET /api/services/providers/:id`: Get provider profile with reviews

### Appointments
- `POST /api/appointments`: Customer books appointment (`SVT-BK-XXXXXX`)
- `GET /api/appointments`: List appointments (role-scoped)
- `GET /api/appointments/:id`: Appointment details + audit status history
- `PATCH /api/appointments/:id/status`: Transition status (`accepted`, `rejected`, `in_progress`, `completed`, `cancelled`). *When provider accepts, automatically generates Work Order!*
- `DELETE /api/appointments/:id`: Cancel appointment

### Work Orders
- `GET /api/work-orders`: List work orders (role-scoped)
- `GET /api/work-orders/:id`: Full work order details with scope snapshot, approved additions, and before/after photos
- `PATCH /api/work-orders/:id/status`: Update status, log progress notes, or upload photos

### Scope Changes (Audit Trail)
- `POST /api/scope-changes`: Submit scope change request with proposed tasks, reasons, and additional cost
- `GET /api/scope-changes`: List scope changes
- `GET /api/scope-changes/:workOrderId`: Get all scope changes for a work order
- `PATCH /api/scope-changes/:id/decision`: Counter-party approves or rejects scope change. *If approved, automatically adjusts work order total cost!*

### Completion & Sign-Off
- `POST /api/completion/:workOrderId/request`: Provider marks work complete, attaches before/after photos & notes
- `POST /api/completion/:workOrderId/approve`: Customer inspects work and signs off with 1–5 star rating & feedback
- `POST /api/completion/:workOrderId/report-issue`: Customer flags issue on completed work
- `GET /api/completion`: List completion records

### Disputes
- `POST /api/disputes`: Raise dispute (`incomplete_work`, `unauthorized_charges`, etc.)
- `GET /api/disputes`: List disputes
- `GET /api/disputes/:id`: Dispute details and message thread
- `POST /api/disputes/:id/messages`: Add reply message in dispute conversation
- `PATCH /api/disputes/:id`: Admin resolves or closes dispute with official summary

### Notifications & Reviews
- `GET /api/notifications`: List notifications + unread count
- `PATCH /api/notifications/:id/read`: Mark notification read
- `PATCH /api/notifications/read-all`: Mark all read
- `POST /api/reviews`: Submit review for completed appointment
- `GET /api/reviews/provider/:providerId`: Get provider reviews

### Admin Operations
- `GET /api/admin/stats`: Live database counts (customers, providers, appointments, revenues)
- `GET /api/admin/users`: Search & filter users
- `PATCH /api/admin/users/:userId/status`: Suspend or activate user account
- `GET /api/admin/activity`: Global system audit event stream

---

## 7. Deployment Instructions

### A. Database Deployment (MongoDB Atlas)
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere).
3. Under **Database Access**, create a user and copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/servicevisit-tracker?retryWrites=true&w=majority`

### B. Backend Deployment (Render)
1. Connect your repository to Render as a **Web Service**.
2. Root directory: `server`
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A strong random string>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. (Optional) Run `npm run seed` once in the Render Shell to seed production demo data.

### C. Frontend Deployment (Vercel)
1. Import your repository into Vercel.
2. Root directory: `client`
3. Framework Preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
7. Deploy!

---

## 8. License

MIT License. Designed and built for transparent, auditable household service appointment management.

