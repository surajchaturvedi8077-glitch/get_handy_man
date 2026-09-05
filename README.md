# Get Handyman — Worker App

A full-stack rebuild of the Get Handyman worker-app prototype:
**Node.js/Express backend + MongoDB**, and two frontends —
a **React Native (Expo) native Android app** (the primary client) and
a **React web app** (kept from an earlier pass, in case it's useful).
Every screen is broken into small, single-purpose components/modules
with a short header comment explaining what each one does and why,
across all three.

```
get-handyman-app/
├── backend/     Express + Mongoose API
├── mobile/      React Native (Expo) — the native Android app
└── frontend/    Vite + React — web version (optional/secondary)
```

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # creates a default admin login + settings
npm run dev                 # starts on http://localhost:5000
```

Default seeded login: `admin@gethandyman.com.au` / `ChangeMe123!` — change it
after first login (there's no "change password" UI yet; update it directly in
Mongo or extend authController.js).

### 2. Mobile (native Android app — primary client)

```bash
cd mobile
cp .env.example .env      # set EXPO_PUBLIC_API_URL — see mobile/README.md
npm install
npx expo start              # scan the QR with Expo Go on your Android phone
```

Full details — pointing it at your backend (emulator vs. physical
phone vs. deployed), and building an installable `.apk` via EAS —
are in `mobile/README.md`.

### 3. Web frontend (optional/secondary)

```bash
cd frontend
cp .env.example .env      # VITE_API_URL can stay blank in dev
npm install
npm run dev                 # starts on http://localhost:5173
```

The dev server proxies `/api` and `/uploads` to `http://localhost:5000`
(see `vite.config.js`), so the frontend and backend can run side by side
without CORS setup in development.

## About the `.env` files

No `.env` was attached to the original request, so all three apps ship with a
documented `.env.example` instead — copy it to `.env` and fill in real
values (MongoDB connection string, JWT secret, etc.) before running.

## Where things live

### Backend (`backend/src/`)
| Folder | Purpose |
|---|---|
| `config/` | env loading + MongoDB connection |
| `models/` | Mongoose schemas: User, Settings, Enquiry, Job, Invoice |
| `middleware/` | auth (JWT), file upload, error handling |
| `services/` | pure business logic — GST/cost totals, the business Report, invoice numbering |
| `controllers/` | one file per resource, small single-purpose handler functions |
| `routes/` | one file per resource, mounted together in `routes/index.js` |

### Mobile (`mobile/src/`) — the native Android app

| Folder | Purpose |
|---|---|
| `services/` | **the API layer** — one Axios client + one file per resource; every screen calls through here, see `mobile/README.md` |
| `context/` | Auth, Settings, Toast — app-wide state (AsyncStorage-backed) |
| `hooks/` | data-fetching hooks pairing each resource with loading/error state and actions |
| `theme/` | colors.js / spacing.js — same palette as the web app, as plain JS (no CSS in React Native) |
| `components/ui/` | generic building blocks (Button, Card, Chip, Toggle, StatRow…) |
| `components/enquiries/`, `jobs/`, `invoices/`, `report/`, `settings/`, `auth/` | one small component per piece of UI, feature by feature |
| `components/layout/` | ScreenHeader |
| `navigation/` | RootNavigator (login gate) → MainTabNavigator (bottom tabs) → one stack per tab |
| `screens/` | one screen per route — composes small components + a data hook, nothing else |

### Frontend (`frontend/src/`) — optional web version

| Folder | Purpose |
|---|---|
| `api/` | one thin wrapper file per backend resource, all built on `axiosClient.js` |
| `context/` | Auth, Settings, Toast — app-wide state |
| `hooks/` | data-fetching hooks pairing each resource with loading/error state and actions |
| `components/ui/` | generic building blocks (Button, Card, Chip, Toggle, StatRow…) |
| `components/enquiries/`, `jobs/`, `invoices/`, `report/`, `settings/`, `auth/` | one small component per piece of UI, feature by feature |
| `components/layout/` | shared shell pieces (ScreenHeader, AppShell) |
| `pages/` | one page per route — composes the small components + a data hook, nothing else |
| `routes/` | the route table and the login-gate wrapper |

## Business logic carried over from the prototype

The Report screen (was "Summary") and invoice GST logic match what was
built into the HTML prototype:

- **Reported income** — subtotal of invoices with GST included
- **Cash Bonus** (was "NRI") — subtotal of invoices without GST
- **GST on material** — 10% of total material expenses
- **Reportable GST** — GST collected minus GST on material
- **Material expenses** / **Other expenses** (was "Vehicle expenses") — each
  expense is just a name, a cost, and an optional receipt photo
- **Profit** — income minus material & other expenses

All of this lives in `backend/src/services/gstService.js` and
`reportService.js` — one place, so the frontend never re-implements the maths.

## Not included yet

- Invoice/quote PDF generation and the "Share" flow (buttons are wired up
  as callbacks in `InvoiceActions.jsx` — plug in your PDF/share
  integration of choice)
- Automated tests
- Deployment config (Docker, CI) — the two apps are plain Node/Vite projects
  and can be deployed anywhere that runs those
