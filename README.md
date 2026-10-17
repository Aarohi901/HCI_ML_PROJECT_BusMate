# BusMate (SmartBus Transit & ML Intelligence Platform)

An enterprise-grade, accessible municipal transit booking platform and machine-learning intelligence system for Pune intra-city public transport (**PMPML — Pune Mahanagar Parivahan Mahamandal Ltd**).

BusMate integrates real-time transit schedules, single-deck city bus seating cabin allocation, post-booking digital e-tickets, an Agent/Admin ML laboratory with Explainable AI (SHAP) and counterfactual fairness calibration, and an advanced accessibility engine with Left-Hand Mode and tri-lingual localization (English, Hindi, Marathi).

---

## 🌟 Key Features & Architecture

### 1. Passenger Booking & PMPML Transit Engine
- **Authentic PMPML Intra-City Services**: High-frequency departures (05:30 to 23:00) spanning **Route 5**, **Route 3**, **Route 4 ATAL**, and **Route 24** between *Swargate Bus Stand* and *Pune Central Railway Station* at verified municipal fares (₹10–₹25).
- **Urban City Bus Cabin Selection**: Single-deck 2+2 Low-Floor seating layout (24 seats) with designated front-row priority seating for women and senior citizens.
- **Instant Booking & Payment Flow**: Multi-gateway mock checkout (UPI, Debit/Credit Card, Net Banking) with real-time seat locks and inventory sync.
- **Printable Digital E-Ticket**: Post-booking confirmation with dynamic QR code, PNR identification, onboard validation instructions, and `@media print` single-page printable PDF layout.

### 2. Explainable AI & Operations Intelligence Portal
- **Real-Time Demand & Overcrowding Prediction**: Machine learning regression and multi-factor classification assessing route delays, historical occupancy, and weather patterns.
- **Explainable AI (SHAP Lab)**: Feature attribution breaking down passenger-friendly explanations alongside technical SHAP attribution weights.
- **Counterfactual Fairness Engine**: Single-passenger perturbation experiments evaluating demographic parity, utility-fairness trade-offs, and Pareto knee-point policy calibration under hard capacity bounds.
- **Operational Fleet Recommendations**: Automated fleet management insights with real-time Accept/Reject simulation workflows.

### 3. Industry-Leading Accessibility & Ergonomics
- **A11y Engine (14+ Assistive Modes)**: High contrast, text spacing, dyslexia-friendly typography, ADHD reading guide, monochrome/high saturation filters, animation freeze, and high-visibility cursor.
- **Left-Hand Ergonomic Reach Mode**: Complete layout inversion adapting primary action buttons, search bars, and mobile sticky actions for comfortable one-handed left-thumb operation.
- **Reactive Client-Side i18n Localization**: Instant, zero-reload app-wide translation across **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 📋 System Prerequisites

Ensure you have the following installed locally:

- **Node.js**: `v18.0.0` or higher (tested on Node v20/v22/v25)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14` or higher (tested on PostgreSQL 18)
- **Python**: `v3.10+` (optional, for ML data seeding scripts)
- **Git**: `v2.30+`

---

## 🚀 5-Minute Quickstart & Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-org-or-username>/hci_project.git
cd hci_project
```

### Step 2: Setup Environment Variables
Copy the sanitized environment configuration template to both the project root and server directory:

```bash
# Copy root environment template
cp .env.example .env

# Copy backend server environment template
cp server/.env.example server/.env
```

Open `.env` and `server/.env` in your editor and configure your local PostgreSQL database credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartbus_db?schema=public"
JWT_SECRET="busmate_super_secret_jwt_key_2026_xyz"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```
*(Note: If your database password contains special characters like `@` or `#`, ensure it is URL-encoded, e.g. `post@24` → `post%4024`)*.

---

### Step 3: Install Dependencies
Install all project dependencies:

```bash
npm install
```

---

### Step 4: Run Database Migrations & Seed PMPML Data
Generate the Prisma client, run database migrations to create all PostgreSQL tables, and seed authentic PMPML routes and schedules:

```bash
# 1. Run Prisma database migration (creates smartbus_db schema in PostgreSQL)
npx prisma migrate dev --name init --schema=server/prisma/schema.prisma

# 2. Seed default users, PMPML routes, and schedules
npm run db:seed
```

You will see confirmation logs:
```text
✅ Users created: admin, agent, commuter
✅ Seeded transit routes
✅ Seeded authentic PMPML intra-city routes & schedules
✅ Seeded 62 scheduled bus trips
🎉 Database seeding completed successfully!
```

---

### Step 5: Start the Development Servers

Run the frontend client and backend Express API concurrently:

```bash
# Terminal 1: Start Express API Backend (Port 5000)
npm run server

# Terminal 2: Start Vite Frontend Client (Port 5173)
npm run dev
```

Visit the application in your browser:
- **Passenger App & Schedules**: `http://localhost:5173`
- **Search Swargate ➔ Pune Station**: `http://localhost:5173/find-bus?from=Swargate%2C+Pune&to=Railway+Station%2C+Pune`
- **Agent & Admin Portal**: `http://localhost:5173/agent`
- **Backend Health Check**: `http://localhost:5000/api/health`
- **Backend Bus API**: `http://localhost:5000/api/buses`

---

## 🗂️ Repository Directory Structure

```text
hci_project/
├── .env.example             # Safe template for root environment variables
├── .gitignore               # Strict gitignore protecting secrets & builds
├── README.md                # Project documentation & onboarding guide
├── package.json             # Root scripts and shared dependencies
├── index.html               # Main HTML entrypoint with a11y skip links
├── vite.config.js           # Vite development and bundle configuration
├── tailwind.config.js       # Custom transit design tokens & fonts
│
├── server/                  # Node.js + Express Backend
│   ├── .env.example         # Server-specific environment template
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL database models (User, Route, Trip, Booking)
│   │   ├── seed.js          # PMPML transit database seeder
│   │   └── migrations/      # Versioned SQL migrations
│   └── src/
│       ├── app.js           # Express application configuration & middleware
│       ├── index.js         # HTTP server entrypoint (Port 5000)
│       ├── controllers/     # Route, bus search, booking, and auth controllers
│       ├── middleware/      # JWT auth, CORS, and error handlers
│       └── routes/          # Express API router declarations
│
├── src/                     # React 18 Frontend Application
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Header, Navigation, Modals, Footer
│   │   ├── passenger/       # BusCard, SearchRibbon, DeckSeatPicker, TicketReceipt
│   │   └── a11y/            # Accessibility Toolbar, Left-Hand Mode, Reading Mask
│   ├── context/             # Global contexts (Auth, Accessibility, Translation)
│   ├── data/                # Static PMPML routes and fallback transit datasets
│   ├── i18n/                # Localization dictionaries (English, Hindi, Marathi)
│   ├── pages/               # Route views (Home, FindBus, Agent, LiveTracking)
│   └── services/            # Client-side API client and seat inventory hooks
│
└── docs/                    # Architectural reports, specifications, and test results
```

---

## 🤝 Team Collaboration & Git Branching Guidelines

To maintain code stability and protect sensitive production secrets, all contributors must observe these branching rules:

1. **Never Commit Directly to `main`**:
   The `main` branch is protected and reserved for tested, production-ready code.
2. **Feature Branch Convention**:
   Always create an isolated branch named with your feature or fix:
   ```bash
   # New feature
   git checkout -b feature/pmpml-live-tracking

   # Bug fix
   git checkout -b fix/seat-picker-modal-mobile
   ```
3. **Commit Message Semantics**:
   Write descriptive semantic commit messages:
   - `feat: add PMPML electric AC bus filtering`
   - `fix: prevent select seats CTA overlap on tablet viewports`
   - `docs: update onboarding setup instructions in README`
4. **Secret Hygiene**:
   - Double check `git status` prior to committing.
   - **Never** add `.env` files, certificates, or personal database passwords to version control.
   - All environment variable changes must be documented in `.env.example`.
5. **Pull Requests (PRs)**:
   - Run `npm run build` locally to verify that Vite bundles with zero syntax or linting errors before pushing.
   - Open a PR into `main` detailing your changes, screenshots of UI adjustments, and test verification.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite frontend dev server at `http://localhost:5173` |
| `npm run server` | Starts Express backend server at `http://localhost:5000` |
| `npm run build` | Builds optimized production bundle into `/dist` |
| `npm run preview` | Previews the production build locally |
| `npm run db:generate` | Regenerates Prisma Client from `schema.prisma` |
| `npm run db:seed` | Seeds PostgreSQL database with PMPML transit data |
| `npm run db:studio` | Launches Prisma Studio GUI for visual database inspection |

---

## 📄 License
Academic Transit Prototype & Open Public Transport Project. All Rights Reserved.
